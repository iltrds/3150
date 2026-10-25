/* Parse trees as inline SVG, shared by study guides: ptree([label, child, …]); a plain string is a leaf. */
(function () {
  // Parse tree as inline SVG. spec = [label, child, child, …]; a plain string is a leaf (terminal).
  function ptree(spec, caption) {
    var W = 40, LH = 46, leaves = 0, maxDepth = 0, nodes = [], edges = [];
    function depthOf(n, d) { if (typeof n === 'string') { maxDepth = Math.max(maxDepth, d); return; } n.slice(1).forEach(function (c) { depthOf(c, d + 1); }); }
    depthOf(spec, 0);
    function lay(n, d) {
      if (typeof n === 'string') { var x = leaves++ * W + W / 2; nodes.push({ x: x, y: maxDepth * LH + 26, t: n, leaf: true }); return { x: x, y: maxDepth * LH + 26 }; }
      var kids = n.slice(1).map(function (c) { return lay(c, d + 1); });
      var x = (kids[0].x + kids[kids.length - 1].x) / 2, y = d * LH + 20;
      kids.forEach(function (k) { edges.push([x, y + 6, k.x, k.y - 14]); });
      nodes.push({ x: x, y: y, t: n[0], leaf: false });
      return { x: x, y: y };
    }
    lay(spec, 0);
    var w = leaves * W, h = maxDepth * LH + 36;
    var s = '<svg class="ptree" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="' + (caption || 'Parse tree') + '">';
    edges.forEach(function (e) { s += '<line x1="' + e[0] + '" y1="' + e[1] + '" x2="' + e[2] + '" y2="' + e[3] + '"/>'; });
    nodes.forEach(function (n) { s += '<text x="' + n.x + '" y="' + n.y + '" text-anchor="middle" class="' + (n.leaf ? 'term' : 'var') + '">' + (n.leaf ? n.t : '⟨' + n.t + '⟩') + '</text>'; });
    return s + '</svg>';
  }
  window.ptree = ptree;
})();
