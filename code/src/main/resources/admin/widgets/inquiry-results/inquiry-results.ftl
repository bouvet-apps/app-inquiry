<widget class="inquiry-results">
  <link rel="stylesheet" href="${urlCss?html}">
  <#if title?has_content>
    <h2>${title?html}</h2>
    <p><@localize locale="${locale}" key="tool.totalReplies" />: ${count?c}</p>
  </#if>
  <#if count == 0>
    <p><@localize locale="${locale}" key="${message}" /></p>
  <#else>
    <#list questions as question>
      <h3>${question.title?html}</h3>
      <#if question.answers?has_content>
        <table>
          <thead>
            <tr>
              <th scope="col"><@localize locale="${locale}" key="tool.answer" /></th>
              <th scope="col"><@localize locale="${locale}" key="tool.count" /></th>
            </tr>
          </thead>
          <tbody>
            <#list question.answers as answer>
              <tr><td>${answer.text?html}</td><td>${answer.count?c}</td></tr>
            </#list>
          </tbody>
        </table>
      <#else>
        <p><@localize locale="${locale}" key="tool.noData" /></p>
      </#if>
    </#list>
  </#if>
</widget>
