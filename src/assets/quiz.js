// RCF interactive poetry quiz. Same behaviour as the original Yola quizzes;
// each page supplies its own questions in a <script type="application/json"> inside .rcf-quiz.
(function () {
  document.querySelectorAll('.rcf-quiz').forEach(function (root) {
    var data = JSON.parse(root.querySelector('script[type="application/json"]').textContent);
    var id = root.id;
    var box = root.querySelector('.questions');
    var result = root.querySelector('.result');
    var start = 'Choose one answer for each question.';
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function draw() {
      box.innerHTML = data.map(function (x, i) {
        return '<fieldset><legend>' + (i + 1) + '. ' + esc(x.q) + '</legend>' +
          x.opts.map(function (o, j) {
            return '<label><input type="radio" name="' + id + '-q' + i + '" value="' + j + '">' + esc(o) + '</label>';
          }).join('') + '<div class="feedback" aria-live="polite"></div></fieldset>';
      }).join('');
      result.textContent = start;
    }
    root.querySelector('.check').onclick = function () {
      var score = 0, done = 0;
      data.forEach(function (x, i) {
        var fs = box.children[i], picked = fs.querySelector('input:checked'), fb = fs.querySelector('.feedback');
        fs.querySelectorAll('label').forEach(function (l) { l.classList.remove('correct', 'wrong'); });
        fs.querySelectorAll('label')[x.a].classList.add('correct');
        if (picked) {
          done++;
          if (+picked.value === x.a) { score++; fb.className = 'feedback good'; fb.textContent = 'Correct — ' + x.why; }
          else { picked.closest('label').classList.add('wrong'); fb.className = 'feedback bad'; fb.textContent = 'Not quite — ' + x.why; }
        } else { fb.className = 'feedback bad'; fb.textContent = 'Please choose an answer. ' + x.why; }
      });
      var pct = Math.round(score / data.length * 100);
      result.textContent = 'Score: ' + score + '/' + data.length + ' (' + pct + '%). ' +
        (done < data.length ? 'Answer every question and check again.' :
          pct >= 80 ? 'Excellent work!' : pct >= 60 ? 'Good effort—review the explanations and try again.' : 'Review the poem and try once more.');
    };
    root.querySelector('.reset').onclick = function () { draw(); root.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    draw();
  });
})();
