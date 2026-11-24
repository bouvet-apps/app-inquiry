<widget class="inquiry-results">
  <link rel="stylesheet" href="${urlCss?html}">
  <#if title?has_content>
    <h2>${title?html}</h2>
  </#if>
  <#if count?has_content>
    <p class="count">${portal.localize("tool.totalReplies")}: ${count?c}</p>
  </#if>
  <#if urlTool?has_content>
    <a class="go-to-tool" href="${urlTool?html}" target="_blank" rel="noopener">${portal.localize("widget.openTool")}</a>
  </#if>
  <#if count == 0>
    <p>${portal.localize(message)}</p>
  <#else>
    <#list questions as question>
      <button id="question${question?counter}" class="question expanded" aria-controls="answers${question?counter}" aria-expanded="true" onclick="toggleInquiryAnswers(${question?counter})" title="${portal.localize("tool.toggleTitle")}">
        <span class="arrow">&gt;</span>
        <strong>${question.title?html}</strong>
        <span class="question__count">(${question.answerCount?c})</span>
      </button>
      <div id="answers${question?counter}" class="answers display">
        <#if question.answers?has_content>
          <table>
            <thead>
              <tr>
                <th scope="col">${portal.localize("tool.answer")}</th>
                <th scope="col">${portal.localize("tool.count")}</th>
              </tr>
            </thead>
            <tbody>
              <#list question.answers as answer>
                <tr><td>${answer.text?html}</td><td>${answer.count?c}</td></tr>
              </#list>
            </tbody>
          </table>
        <#else>
          <p>${portal.localize("tool.noData")}</p>
        </#if>
      </div>
    </#list>
  </#if>
  <script type="text/javascript">
    function toggleInquiryAnswers(number) {
      var question = document.getElementById("question" + number);
      var answers = document.getElementById("answers" + number);
      var expanded = question.getAttribute("aria-expanded") === "true";

      question.setAttribute("aria-expanded", String(!expanded));
      question.classList.toggle("expanded", !expanded);
      answers.classList.toggle("display", !expanded);
    }
  </script>
</widget>
