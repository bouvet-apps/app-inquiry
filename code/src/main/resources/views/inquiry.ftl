<div id="inquiry-box" data-identifier="${identifier}" data-testmode="${testmode?c}" class="inquiry-box inquiry-box--${boxPosition} inquiry-box--${theme} inquiry-hidden" style="${(boxZindex?has_content)?then('z-index: ${boxZindex};', '')}${(fontSize?has_content)?then('font-size: ${fontSize}px;', '')}">
  <div class="inquiry-box__wrapper">
    [#if (boxTitle?has_content)]
      <div class="inquiry-box__title">
        ${boxTitle}
      </div>
    [/#if]
    [#if (boxText?has_content)]
      <div class="inquiry-box__text">
        ${boxText}
      </div>
    [/#if]
    [#if (boxContinue?has_content)]
      <button id="inquiry-box-continue" class="${theme?contains('minimal')?then('button', 'inquiry-box__continue')}" aria-haspopup="dialog">${boxContinue}</button>
    [/#if]
  </div>
  <button id="inquiry-box-close" class="inquiry-box__close" title="${titleClose}" aria-label="${titleClose}">&#10006;</button>
</div>

<div id="inquiry-popupmodal" class="inquiry-popupmodal inquiry-hidden" style="${(popupZindex?has_content)?then('z-index: ${popupZindex};', '')}${(fontSize?has_content)?then('font-size: ${fontSize}px;', '')}">
  <div class="inquiry-popup inquiry-popup--${theme}" role="dialog" aria-modal="true">
    <div id="inquiry-popup-questions" class="inquiry-popup__questions">
      [#if (popupTitle?has_content)]
        <div class="inquiry-popup__title">
          ${popupTitle}
        </div>
      [/#if]
      [#if (popupText?has_content)]
        <div class="inquiry-popup__text">
          ${popupText}
        </div>
      [/#if]
      [#if (popupQuestions?? && popupQuestions?has_content)]
        <form id="inquiry-popup-form" method="post" action="${inquiryServiceUrl}" autocomplete="off">
          <div class="inquiry-hidden">
            <input type="text" name="inquiryBait">
          </div>
          [#list popupQuestions as popupQuestion]
            [#if (popupQuestion._selected == "textlineAnswer" && popupQuestion.textlineAnswer.id?has_content)]
              <label for="answer-${popupQuestion.textlineAnswer.id}" class="inquiry-popup__questions__question">
                ${popupQuestion.textlineAnswer.question!''}
              </label>
              <input type="text" maxlength="50" id="answer-${popupQuestion.textlineAnswer.id}" name="${popupQuestion.textlineAnswer.id}" ${popupQuestion.textlineAnswer.required?then('required', '')} ${(popupQuestion.textlineAnswer.placeholder?has_content)?then('placeholder="${popupQuestion.textlineAnswer.placeholder}"', '')}>
            [#elseif (popupQuestion._selected == "textareaAnswer" && popupQuestion.textareaAnswer.id?has_content)]
              <label for="answer-${popupQuestion.textareaAnswer.id}" class="inquiry-popup__questions__question">
                ${popupQuestion.textareaAnswer.question!''}
              </label>
              <textarea maxlength="500" id="answer-${popupQuestion.textareaAnswer.id}" name="${popupQuestion.textareaAnswer.id}" ${popupQuestion.textareaAnswer.required?then('required', '')} ${(popupQuestion.textareaAnswer.placeholder?has_content)?then('placeholder="${popupQuestion.textareaAnswer.placeholder}"', '')}></textarea>
            [#elseif (popupQuestion._selected == "radiobuttonAnswer" && popupQuestion.radiobuttonAnswer.id?has_content)]
              <div class="inquiry-popup__questions__question">
                ${popupQuestion.radiobuttonAnswer.question!''}
              </div>
              [#list popupQuestion.radiobuttonAnswer.answerOptions as answerOption]
                <div class="inquiry-popup__questions__answer">
                  <input type="radio" id="answer-${popupQuestion.radiobuttonAnswer.id}${answerOption?counter}" name="${popupQuestion.radiobuttonAnswer.id}" value="${answerOption.text!''}" ${popupQuestion.radiobuttonAnswer.required?then('required', '')} ${answerOption.default?then('checked', '')}>
                  <label for="answer-${popupQuestion.radiobuttonAnswer.id}${answerOption?counter}">${answerOption.text!''}</label>
                </div>
              [/#list]
            [#elseif (popupQuestion._selected == "checkboxAnswer" && popupQuestion.checkboxAnswer.id?has_content)]
              <div class="inquiry-popup__questions__question">
                ${popupQuestion.checkboxAnswer.question!''}
              </div>
              [#list popupQuestion.checkboxAnswer.answerOptions as answerOption]
                <div class="inquiry-popup__questions__answer">
                  <input type="checkbox" id="answer-${popupQuestion.checkboxAnswer.id}${answerOption?counter}" name="${popupQuestion.checkboxAnswer.id}" value="${answerOption.text!''}" ${popupQuestion.checkboxAnswer.required?then('required', '')} ${answerOption.default?then('checked', '')}>
                  <label for="answer-${popupQuestion.checkboxAnswer.id}${answerOption?counter}">${answerOption.text!''}</label>
                </div>
              [/#list]
            [/#if]
          [/#list]
          <button id="inquiry-popup-finish" type="submit" class="${theme?contains('minimal')?then('button', 'inquiry-popup__finish')}">${popupSubmit}</button>
        </form>
        <div id="inquiry-popup-error" class="inquiry-popup__error inquiry-hidden">
          ${submitError}
        </div>
      [/#if]
    </div>
    [#if popupResponseTitle?has_content || popupResponseText?has_content]
      <div id="inquiry-popup-response" class="inquiry-popup__response inquiry-hidden">
        [#if (popupResponseTitle?has_content)]
          <div class="inquiry-popup__title">
              ${popupResponseTitle}
          </div>
        [/#if]
        [#if (popupResponseText?has_content)]
          <div class="inquiry-popup__text">
            ${popupResponseText}
          </div>
        [/#if]
      </div>
    [/#if]
    <button id="inquiry-popup-close" class="inquiry-popup__close" title="${titleClose}" aria-label="${titleClose}">&#10006;</button>
  </div>
</div>
