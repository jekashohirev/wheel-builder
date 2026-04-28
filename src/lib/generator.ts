import type { WidgetConfig } from './config'
import { getPalette, contrastColor } from './theme'

function escHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function escJsString(s: string): string {
  return JSON.stringify(s)
}

function normalizeWeights(config: WidgetConfig) {
  const sum = config.segments.reduce((acc, s) => acc + (Number.isFinite(s.weight) ? s.weight : 0), 0)
  if (sum <= 0) return config.segments.map((s) => ({ ...s, weight: 1 }))
  return config.segments.map((s) => ({ ...s, weight: Math.max(0, s.weight) }))
}

/** Собирает popup-объект в формате эталонного сниппета CarrotQuest.
 * Цвета попапа выводятся из theme.mode (getPalette); цвет кнопки — из config.buttonColor. */
function buildPopupConfig(config: WidgetConfig) {
  const palette = getPalette(config.theme.mode)
  const accent = config.buttonColor || config.theme.accent || palette.primary
  const text = palette.text
  const titleColor = config.theme.mode === 'light' ? '#232323' : text
  const bg = palette.bg
  const subText = palette.subText
  const br = config.borderRadius ?? 0
  const inputBorder = config.theme.mode === 'dark' ? '#595959' : '#C2C0BB'
  const closeColor = config.theme.mode === 'dark' ? '#FFFFFF' : '#000000'

  const baseCss = (props: string) => ` ${props.replace(/\s+/g, ' ').trim().replace(/;/g, '; ')} `
  return {
    cqpopup_name: config.cqpopupName,
    close: {
      css: baseCss(`background-color: ${closeColor}; height: 20px;`),
      cssMobile: baseCss(`background-color: ${closeColor}; height: 20px;`),
    },
    title: {
      active: true,
      text: config.title,
      css: baseCss(`text-align: left; font-size: 36px; line-height: 40px; font-weight: 600; color: ${titleColor}; margin-bottom: 10px; width: 100%;`),
      cssMobile: baseCss(`font-size: 26px; line-height: 30px; font-weight: 600; color: ${titleColor}; text-align:center; margin-bottom: 10px;`),
    },
    text: {
      active: true,
      text: config.subtitle,
      css: baseCss(`text-align: left; font-size: 16px; line-height: 24px; color: ${subText}; margin-bottom: 20px; width: 100%;`),
      cssMobile: baseCss(`font-size: 14px; line-height: 20px; text-align:center; margin-bottom: 20px;`),
    },
    titleThanks: {
      active: true,
      text: config.thankYou?.title ?? 'Поздравляем!',
      css: baseCss(`text-align: left; font-size: 36px; line-height: 40px; font-weight: 600; color: ${titleColor}; margin-bottom: 10px; width: 100%;`),
      cssMobile: baseCss(`font-size: 26px; line-height: 30px; font-weight: 600; color: ${titleColor}; text-align:center; margin-bottom: 10px;`),
    },
    textThanks: {
      active: true,
      text: config.thankYou?.subtitle ?? 'Мы отправили информацию на почту. Если письмо не придет в течение 5 минут, проверьте папку «Спам».',
      css: baseCss(`text-align: left; font-size: 16px; line-height: 24px; font-weight: 400; color: ${subText}; margin-bottom: 20px; width: 100%;`),
      cssMobile: baseCss(`font-size: 14px; line-height: 20px; font-weight: 400; text-align:center; margin-bottom: 20px;`),
    },
    phone: {
      active: config.enabledFields.phone,
      required: true,
      placeholder: '+7 (999) 999-99-99',
      css: baseCss(`font-size: 16px; font-weight: 400; color: ${text}; background-color: ${bg}; text-align: left; height: 60px; width: 100%; margin-bottom: 10px; padding: 0 20px; border:1px solid ${inputBorder}; border-radius: ${br}px;`),
      cssMobile: baseCss(`font-size: 14px; text-align: left; height:45px; margin-bottom:10px;`),
      cssPlaceholder: baseCss(`font-size: 14px; color: ${subText};`),
      cssMobilePlaceholder: baseCss(`font-size: 14px; color: ${subText};`),
    },
    email: {
      active: config.enabledFields.email,
      required: true,
      placeholder: 'Ваш email',
      css: baseCss(`font-size: 16px; border: 1px solid ${inputBorder}; border-radius: ${br}px; color: ${text}; font-weight: 400; background-color: ${bg}; text-align: left; height: 60px; width: 100%; margin-bottom: 10px; padding: 0 20px;`),
      cssPlaceholder: baseCss(`font-size: 14px; font-weight: 400; color: ${subText};`),
      cssMobile: baseCss(`height: 45px; font-size: 14px; text-align: left; margin-bottom: 10px;`),
      cssMobilePlaceholder: baseCss(`font-size: 14px; font-weight: 400; color: ${subText};`),
    },
    name: {
      active: config.enabledFields.name,
      required: true,
      placeholder: 'Ваше имя',
      css: baseCss(`font-size: 16px; font-weight: 400; border: 1px solid ${inputBorder}; border-radius: ${br}px; color: ${text}; background-color: ${bg}; text-align: left; height: 60px; width: 100%; margin-bottom: 10px; padding: 0 20px;`),
      cssPlaceholder: baseCss(`font-size: 14px; color: ${subText};`),
      cssMobile: baseCss(`height: 45px; font-size: 14px; text-align: left; margin-bottom: 10px;`),
      cssMobilePlaceholder: baseCss(`font-size: 14px; color: ${subText};`),
    },
    button: {
      elem: 'button',
      type: 'submit',
      text: config.buttonText,
      css: baseCss(`font-size: 16px; border-radius: ${br}px; color: #fff; font-weight: 500; background-color: ${accent}; height: 60px; width: 100%; text-transform: none;`),
      cssMobile: baseCss(`height: 50px; font-size: 14px; text-align: center;`),
    },
    pointer: {
      src: 'https://files.carrotquest.io/message-images/46371/46371-1658134806247-3v00y634.png',
      css: baseCss(`width: 127px; height:125px;`),
      cssMobile: baseCss(`width: 80px; height:79px;`),
    },
  }
}

/** Собирает winWheelSegments из config.segments.
 * Цвета сегментов всегда берутся из config.accentSegmentColor / config.baseSegmentColor (вариант A:
 * кастомные fill/textColor сегментов игнорируются — единый источник правды в блоке «Цвета»).
 * Цвет текста вычисляется автоматически через contrastColor. */
function buildWinWheelSegments(config: WidgetConfig) {
  const normalized = normalizeWeights(config)
  const palette = getPalette(config.theme.mode)
  const base = config.baseSegmentColor || palette.segmentLight
  const accent = config.accentSegmentColor || palette.segmentDark
  return normalized.map((s, i) => {
    const fill = i % 2 === 0 ? base : accent
    return {
      text: s.label.replace(/\n/g, ' '),
      eventText: `${config.cqpopupName} - ${s.label}`,
      eventName: s.eventName != null ? String(s.eventName) : '',
      chanse: s.weight,
      fillStyle: fill,
      textFillStyle: contrastColor(fill),
      textFontWeight: 'normal',
    }
  })
}

const CARROTQUEST_STUB_SCRIPT = `<script>
(function(){
  try {
    if (typeof parent !== 'undefined' && parent.window && !parent.window.carrotquest) {
      parent.window.carrotquest = {
        track: function(){},
        identify: function(){},
        trackMessageInteraction: function(){},
        animation: function(){},
        close: function(){},
        replied: function(){},
        read: function(){}
      };
    }
  } catch(e) {}
})();
</script>
`

/** Vanilla JS phone mask helpers for RU/KZ numbers (+7 (XXX) XXX-XX-XX).
 * Встраивается внутрь <script> попапа и preview iframe — один источник правды. */
const PHONE_MASK_JS_SOURCE = `
function sanitizePhoneDigits(value) {
  return String(value == null ? "" : value).replace(/\\D+/g, "");
}
function normalizeRuKzDigits(digits) {
  if (!digits) return "";
  var d = digits;
  if (d.charAt(0) === "8") d = "7" + d.slice(1);
  else if (d.charAt(0) !== "7") d = "7" + d;
  if (d.length > 11) d = d.slice(0, 11);
  return d;
}
function formatRuKzPhone(digits) {
  if (!digits) return "";
  var rest = digits.slice(1);
  var out = "+7";
  if (rest.length > 0) {
    out += " (" + rest.slice(0, 3);
    if (rest.length >= 3) out += ")";
    if (rest.length > 3) out += " " + rest.slice(3, 6);
    if (rest.length > 6) out += "-" + rest.slice(6, 8);
    if (rest.length > 8) out += "-" + rest.slice(8, 10);
  }
  return out;
}
function getNormalizedPhoneValue(value) {
  var d = normalizeRuKzDigits(sanitizePhoneDigits(value));
  return d ? "+" + d : "";
}
function attachPhoneMask(input) {
  if (!input || input.__cqPhoneMaskAttached) return;
  input.__cqPhoneMaskAttached = true;
  var DIGIT = /\\d/;
  function positionAfterNDigits(str, n) {
    if (n <= 0) {
      for (var i = 0; i < str.length; i++) {
        if (DIGIT.test(str.charAt(i))) return i;
      }
      return str.length;
    }
    var count = 0;
    for (var j = 0; j < str.length; j++) {
      if (DIGIT.test(str.charAt(j))) {
        count++;
        if (count >= n) return j + 1;
      }
    }
    return str.length;
  }
  function setValidity(digits) {
    if (typeof input.setCustomValidity !== "function") return;
    if (!digits) { input.setCustomValidity(""); return; }
    if (digits.length === 11 && digits.charAt(0) === "7") input.setCustomValidity("");
    else input.setCustomValidity("Введите полный номер в формате +7 (XXX) XXX-XX-XX");
  }
  function reformat(rawValue, rawCaret) {
    var digitsBefore = 0;
    for (var i = 0; i < rawCaret && i < rawValue.length; i++) {
      if (DIGIT.test(rawValue.charAt(i))) digitsBefore++;
    }
    var sanitized = sanitizePhoneDigits(rawValue);
    if (!sanitized) {
      input.value = "";
      setValidity("");
      try { input.setSelectionRange(0, 0); } catch(e) {}
      return;
    }
    var frontDelta = 0;
    var d = sanitized;
    if (d.charAt(0) === "8") d = "7" + d.slice(1);
    else if (d.charAt(0) !== "7") { d = "7" + d; frontDelta = 1; }
    if (d.length > 11) d = d.slice(0, 11);
    var target = digitsBefore + frontDelta;
    if (target < 0) target = 0;
    if (target > d.length) target = d.length;
    var formatted = formatRuKzPhone(d);
    var caret = positionAfterNDigits(formatted, target);
    input.value = formatted;
    setValidity(d);
    try { input.setSelectionRange(caret, caret); } catch(e) {}
  }
  input.addEventListener("input", function() {
    var caret = input.selectionStart;
    if (caret == null) caret = input.value.length;
    reformat(input.value, caret);
  });
  input.addEventListener("paste", function(e) {
    var text = "";
    try { text = (e.clipboardData || window.clipboardData).getData("text") || ""; } catch(err) {}
    if (!text) return;
    e.preventDefault();
    var start = input.selectionStart || 0;
    var end = input.selectionEnd || 0;
    var current = input.value;
    var merged = current.slice(0, start) + text + current.slice(end);
    reformat(merged, start + text.length);
  });
  input.addEventListener("keydown", function(e) {
    var key = e.key;
    if (key !== "Backspace" && key !== "Delete") return;
    var start = input.selectionStart;
    var end = input.selectionEnd;
    if (start == null || end == null) return;
    if (start !== end) return;
    var value = input.value;
    if (key === "Backspace") {
      var i = start - 1;
      while (i >= 0 && !DIGIT.test(value.charAt(i))) i--;
      if (i < 0) { e.preventDefault(); return; }
      e.preventDefault();
      reformat(value.slice(0, i) + value.slice(i + 1), i);
    } else {
      var j = start;
      while (j < value.length && !DIGIT.test(value.charAt(j))) j++;
      if (j >= value.length) { e.preventDefault(); return; }
      e.preventDefault();
      reformat(value.slice(0, j) + value.slice(j + 1), j);
    }
  });
  if (input.value) reformat(input.value, input.value.length);
}
`

/** Разбивка и перенос подписи сектора на canvas (preview + сниппет). */
const WHEEL_SECTOR_TEXT_JS = `
function splitWheelWordToLines(ctx, word, maxWidth) {
  var lines = [];
  var i = 0;
  var w = String(word);
  while (i < w.length) {
    var j = i + 1;
    while (j <= w.length && ctx.measureText(w.slice(i, j)).width <= maxWidth) j++;
    if (j > i + 1) {
      lines.push(w.slice(i, j - 1));
      i = j - 1;
    } else {
      lines.push(w.charAt(i));
      i++;
    }
  }
  return lines;
}
function wrapWheelSectorLines(ctx, text, maxWidth) {
  var raw = String(text == null ? "" : text).replace(/^\\s+|\\s+$/g, "");
  if (!raw) return [""];
  if (maxWidth <= 1) {
    return splitWheelWordToLines(ctx, raw.replace(/\\s+/g, ""), 1);
  }
  var words = raw.split(/\\s+/);
  var lines = [];
  for (var wi = 0; wi < words.length; wi++) {
    var word = words[wi];
    if (ctx.measureText(word).width <= maxWidth) {
      if (lines.length) {
        var merged = lines[lines.length - 1] + " " + word;
        if (ctx.measureText(merged).width <= maxWidth) {
          lines[lines.length - 1] = merged;
        } else {
          lines.push(word);
        }
      } else {
        lines.push(word);
      }
    } else {
      var wlines = splitWheelWordToLines(ctx, word, maxWidth);
      for (var li = 0; li < wlines.length; li++) {
        if (lines.length && li === 0) {
          var m2 = lines[lines.length - 1] + " " + wlines[li];
          if (ctx.measureText(m2).width <= maxWidth) {
            lines[lines.length - 1] = m2;
          } else {
            lines.push(wlines[li]);
          }
        } else {
          lines.push(wlines[li]);
        }
      }
    }
  }
  return lines;
}
/** Подбор шрифта и перенос: радиально вдоль биссектрисы (ось X) и по высоте вдоль касательной (ось Y). */
function fitWheelSectorText(ctx, text, innerR, outerR, sliceAngle, startFontSize) {
  var radialPad = 3;
  var minFont = 8;
  var halfAngle = Math.min(sliceAngle / 2, Math.PI / 2);
  var rLabel = Math.floor((innerR + outerR) / 2);
  var maxTangentialH = 2 * rLabel * Math.sin(halfAngle) * 0.82;
  var fontSize = startFontSize;
  var lines = [""];
  var lineHeight = 12;
  while (true) {
    ctx.font = fontSize + "px Inter, Arial";
    var inW = Math.max(0, rLabel - innerR - radialPad);
    var outW = Math.max(0, outerR - rLabel - radialPad);
    var maxRadialW = 2 * Math.min(inW, outW) * 0.8;
    if (maxRadialW < fontSize) maxRadialW = fontSize;
    lines = wrapWheelSectorLines(ctx, text || "", maxRadialW);
    lineHeight = Math.round(fontSize * 1.2);
    var stackH = lines.length > 1 ? (lines.length - 1) * lineHeight : 0;
    if (stackH <= maxTangentialH || fontSize <= minFont) break;
    fontSize -= 1;
  }
  return { lines: lines, fontSize: fontSize, lineHeight: lineHeight, rLabel: rLabel };
}
`

/** CSS попапа/колеса для превью и production HTML (единый источник строк стилей). */
export function buildWheelPreviewThemeCss(config: WidgetConfig): string {
  const popup = buildPopupConfig(config)
  const palette = getPalette(config.theme.mode)
  const accent = config.buttonColor || config.theme.accent || palette.primary
  const bg = palette.bg
  const activeFieldsCount = ['name', 'email', 'phone'].filter((f) => config.enabledFields[f as 'name' | 'email' | 'phone']).length
  const isExpandedMobile = activeFieldsCount >= 3
  const mobileBodyHeight = isExpandedMobile ? 780 : 700
  const mobileWheelSize = isExpandedMobile ? 272 : 292
  const mobileWheelTop = isExpandedMobile ? 24 : 28
  const mobileContentTop = isExpandedMobile ? 312 : 332
  const pbr = config.popupBorderRadius ?? 0
  return `:root{--cq-accent:${accent};--cq-mobile-wheel-size:${mobileWheelSize};}
*{margin:0;padding:0;box-sizing:border-box;-webkit-appearance:none;font-family:"Inter",sans-serif;font-weight:400;}
html,body{height:100%;}
body{overflow:hidden;}
a{color:#0F62FE;}
.cqp__bg{position:fixed;top:0;left:0;z-index:1;height:100%;width:100%;background:rgba(0,0,0,0.5);cursor:pointer;}
.d_flex{display:flex;}
.flex_col{flex-direction:column;}
.wrapper__body{justify-content:center;align-items:center;width:100%;height:100%;}
.cqp__body{display:flex;align-items:center;justify-content:flex-end;position:relative;z-index:2;width:100%;max-width:1024px;height:570px;margin:auto;padding:20px 30px;background:${bg};box-shadow:0px 0px 25px rgba(0,0,0,0.2);border-radius:${pbr}px;}
.cqp__close{position:absolute;top:15px;right:15px;z-index:9;height:30px;width:30px;cursor:pointer;}
.cqp__close:before,.cqp__close:after{position:absolute;top:0;left:0;bottom:0;right:0;width:1px;margin:auto;border-radius:3px;content:"";${popup.close.css}}
.cqp__close:before{transform:rotate(45deg);}
.cqp__close:after{transform:rotate(-45deg);}
.cqp__form{align-items:stretch;justify-content:center;width:100%;}
#form,#form-thank{width:100%;max-width:400px;margin:0 auto;}
#canvas{position:relative;z-index:-2;}
.content-img{position:absolute;left:50px;display:flex;align-items:center;justify-content:center;width:500px;height:500px;overflow:hidden;border-radius:50%;}
.pointer{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:92px;height:92px;border-radius:9999px;background:transparent;border:none;box-shadow:none;z-index:4;display:flex;align-items:center;justify-content:center;isolation:isolate;}
.pointer::before{content:"";position:absolute;right:-15px;top:50%;transform:translateY(-50%);width:0;height:0;z-index:0;border-top:14px solid transparent;border-bottom:14px solid transparent;border-left:18px solid #111827;filter:drop-shadow(0 6px 8px rgba(0,0,0,.18));}
.pointer::after{content:"";position:absolute;inset:0;border-radius:9999px;z-index:2;background:radial-gradient(circle at 50% 50%, rgba(17,24,39,.75) 0, rgba(17,24,39,.75) 5px, #fff 5px, #fff 100%);border:2px solid rgba(17,24,39,.12);box-shadow:0 10px 25px rgba(0,0,0,.18);}
.content-wrap{display:flex;align-items:center;justify-content:center;width:50%;max-width:415px;}
.content-wrap .cqp__form{width:100%;}
.cqp__text{${popup.text.css}}
.cqp__text-h1{${popup.title.css}}
[id^=form-thank] .cqp__text{${popup.textThanks.css}}
[id^=form-thank] .cqp__text-h1{${popup.titleThanks.css}}
.cqp__input[name=name]{${popup.name.css}}
.cqp__input[name=email]{${popup.email.css}}
.cqp__input[name=phone]{${popup.phone.css}}
.cqp__input[name=name]::placeholder{${popup.name.cssPlaceholder}}
.cqp__input[name=email]::placeholder{${popup.email.cssPlaceholder}}
.cqp__input[name=phone]::placeholder{${popup.phone.cssPlaceholder}}
.cqp__input.error{border:1px solid red;}
.cqp__input.success{border:1px solid green;}
.cqp__button{display:flex;align-items:center;justify-content:center;width:100%;border:none;outline:none;cursor:pointer;${popup.button.css}}
.cqp__form .cqp__input,.cqp__form .cqp__button{width:100%;max-width:none;}
.cqp__button:disabled{opacity:0.6;cursor:not-allowed;}
#form .cqp__button[type=submit]{margin-top:10px;}
.cqp__input:focus{border:1px solid var(--cq-accent);outline:none;}
.hidden{display:none;}
@media (max-width:990px){
.cqp__close{top:12px;right:12px;}
.cqp__close:before,.cqp__close:after{${popup.close.cssMobile}}
.cqp__body{flex-direction:column;align-items:stretch;justify-content:flex-start;max-width:350px;height:${mobileBodyHeight}px;padding:18px 15px;}
#canvas{position:absolute;left:0;bottom:0;top:0;right:0;margin:auto;}
.content-img{position:absolute;left:0;right:0;top:${mobileWheelTop}px;width:${mobileWheelSize}px;height:${mobileWheelSize}px;margin:auto;}
.pointer{width:64px;height:64px;}
.pointer::before{right:-11px;top:50%;transform:translateY(-50%);z-index:0;border-top:11px solid transparent;border-bottom:11px solid transparent;border-left:14px solid #111827;}
.pointer::after{z-index:2;background:radial-gradient(circle at 50% 50%, rgba(17,24,39,.75) 0, rgba(17,24,39,.75) 4px, #fff 4px, #fff 100%);}
.content-wrap{width:100%;align-items:stretch;justify-content:flex-start;padding-top:${mobileContentTop}px;}
.cqp__form{width:100%;align-items:stretch;justify-content:flex-start;}
#form,#form-thank{max-width:none;margin:0;}
#form{gap:0;}
#form-thank{gap:0;justify-content:flex-start;}
#form-thank .cqp__button{margin-top:0;}
#form .cqp__button[type=submit]{margin-top:10px;}
.cqp__text{${popup.text.cssMobile}}
.cqp__text-h1{${popup.title.cssMobile}}
[id^=form-thank] .cqp__text{${popup.textThanks.cssMobile}}
[id^=form-thank] .cqp__text-h1{${popup.titleThanks.cssMobile}}
.cqp__input[name=name]{${popup.name.cssMobile}}
.cqp__input[name=email]{${popup.email.cssMobile}}
.cqp__input[name=phone]{${popup.phone.cssMobile}}
.cqp__input[name=name]::placeholder{${popup.name.cssMobilePlaceholder}}
.cqp__input[name=email]::placeholder{${popup.email.cssMobilePlaceholder}}
.cqp__input[name=phone]::placeholder{${popup.phone.cssMobilePlaceholder}}
.cqp__button{${popup.button.cssMobile}}
}`
}

export type WheelPreviewMessage = {
  type: 'WHEEL_PREVIEW_UPDATE'
  themeCss: string
  popup: ReturnType<typeof buildPopupConfig>
  winWheelSegments: ReturnType<typeof buildWinWheelSegments>
  pins: Record<string, unknown>
  animation: Record<string, unknown>
  wheelSettings: Record<string, unknown>
  wheelStroke: string
}

/** Данные для postMessage в локальный preview iframe (без перезагрузки srcDoc). */
export function buildWheelPreviewMessage(config: WidgetConfig): WheelPreviewMessage {
  const popup = buildPopupConfig(config)
  const winWheelSegments = buildWinWheelSegments(config)
  const palette = getPalette(config.theme.mode)
  const accent = config.buttonColor || config.theme.accent || palette.primary
  const wheelStroke = config.theme.mode === 'dark' ? '#595959' : '#fff'
  const pins = { number: 0, outerRadius: 1, lineWidth: 1, margin: 7, fillStyle: accent, strokeStyle: '#fff' }
  const animation = { type: 'spinToStop', duration: 10, spins: 9, stopAngle: null, callbackFinished: 'winPrizeSuccess()' }
  const wheelSettings = {
    canvasId: 'canvas',
    drawMode: 'code',
    imageOverlay: false,
    strokeStyle: null,
    numSegments: winWheelSegments.length,
    pointerAngle: 0,
    textDirection: 'reversed',
    textFontFamily: 'Inter',
    textFontSize: 16,
    textMargin: 20,
    textAlignment: 'center',
    finishTitle: popup.titleThanks.text,
    finishText: popup.textThanks.text,
    segments: winWheelSegments,
    pins,
    animation,
  }
  return {
    type: 'WHEEL_PREVIEW_UPDATE',
    themeCss: buildWheelPreviewThemeCss(config),
    popup,
    winWheelSegments,
    pins,
    animation,
    wheelSettings,
    wheelStroke,
  }
}

/** Статический bootstrap для preview: один раз в srcDoc, дальше только postMessage (нет мерцания в Chrome). */
export const WHEEL_PREVIEW_BOOTSTRAP_SRC_DOC = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style id="cq-preview-theme"></style>
</head>
<body>
<script>
(function(){
  try {
    if (typeof parent !== 'undefined' && parent.window && !parent.window.carrotquest) {
      parent.window.carrotquest = {
        track: function(){}, identify: function(){}, trackMessageInteraction: function(){},
        animation: function(){}, close: function(){}, replied: function(){}, read: function(){}
      };
    }
  } catch(e) {}
})();
</script>
<div class="cqp__bg bg_open"></div>
<div class="wrapper__body d_flex">
<div class="cqp__body d_flex open">
<a class="cqp__close"></a>
<div class="content-img">
<div class="pointer" aria-hidden="true"></div>
<canvas id="canvas" width="500" height="500">Canvas not supported.</canvas>
</div>
<div class="content-wrap d_flex">
<form action="javascript:void(0)" id="form" class="cqp__form d_flex flex_col">
<p class="cqp__text-h1" id="pv-form-h1"></p>
<p class="cqp__text" id="pv-form-text"></p>
<input type="text" name="name" class="cqp__input hidden" id="pv-in-name" />
<input type="tel" name="phone" class="cqp__input hidden" id="pv-in-phone" />
<input type="email" name="email" class="cqp__input hidden" id="pv-in-email" pattern="\\S+@\\S+\\.\\S+" />
<button type="submit" class="cqp__button" id="pv-submit"></button>
</form>
<section id="form-thank" class="cqp__form d_flex flex_col hidden">
<p class="cqp__text-h1" id="pv-thank-h1"></p>
<p class="cqp__text" id="pv-thank-text"></p>
<button type="button" class="cqp__button close_btn">Закрыть</button>
</section>
</div>
</div>
</div>
<script>
var popup = {};
var cqpopup_name = "";
var winWheelSegments = [];
var pins = {};
var animation = {};
var wheelSettings = {};
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var canvasDpr = 1;
var logicalWidth = 500;
var logicalHeight = 500;
var outerRadius = 234;
var innerRadius = 40;
var form = document.getElementById("form");
var formThank = document.getElementById("form-thank");
var currentRotation = 0;
var targetRotation = 0;
var spinStart = 0;
var spinDuration = 10000;
var spinSpins = 9;
var animating = false;
var winningSegmentIndex = 0;
var wheelStrokeStyle = "#fff";

function syncCanvasSize() {
  canvasDpr = Math.max(window.devicePixelRatio || 1, 1);
  var mobileWheelSizeCss = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--cq-mobile-wheel-size"), 10);
  var mobileWheelSize = Number.isFinite(mobileWheelSizeCss) ? mobileWheelSizeCss : 315;
  if (window.innerWidth > 1007) {
    logicalWidth = 500;
    logicalHeight = 500;
    outerRadius = 234;
    innerRadius = 40;
  } else {
    logicalWidth = mobileWheelSize;
    logicalHeight = mobileWheelSize;
    outerRadius = Math.round(logicalWidth * 0.476);
    innerRadius = Math.round(logicalWidth * 0.08);
  }
  canvas.style.width = logicalWidth + "px";
  canvas.style.height = logicalHeight + "px";
  canvas.width = Math.round(logicalWidth * canvasDpr);
  canvas.height = Math.round(logicalHeight * canvasDpr);
  ctx.setTransform(canvasDpr, 0, 0, canvasDpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  if (typeof ctx.imageSmoothingQuality !== "undefined") ctx.imageSmoothingQuality = "high";
}

var carrotquest = {
  track: function(n,p){ try{ parent.window.carrotquest.track(n,p); }catch(e){} },
  identify: function(arr){ try{ parent.window.carrotquest.identify(arr); }catch(e){} },
  trackMessageInteraction: function(id,t){ try{ parent.window.carrotquest.trackMessageInteraction(id,t); }catch(e){} },
  animation: function(){},
  close: function(){ try{ var f=window.frameElement; if(f&&f.parentNode)f.parentNode.removeChild(f); }catch(e){} },
  replied: function(){},
  read: function(){}
};
${PHONE_MASK_JS_SOURCE}
${WHEEL_SECTOR_TEXT_JS}
function drawWheel() {
  var w = logicalWidth;
  var h = logicalHeight;
  var cx = w/2;
  var cy = h/2;
  ctx.setTransform(canvasDpr, 0, 0, canvasDpr, 0, 0);
  ctx.clearRect(0,0,w,h);
  var n = winWheelSegments.length;
  if (!n) return;
  var sliceAngle = (2*Math.PI)/n;
  var startFont = w >= 500 ? 16 : 12;
  for (var i=0;i<n;i++) {
    var seg = winWheelSegments[i];
    var start = -Math.PI/2 + currentRotation + i*sliceAngle;
    ctx.beginPath();
    ctx.arc(cx,cy,outerRadius,start,start+sliceAngle);
    ctx.arc(cx,cy,innerRadius,start+sliceAngle,start,true);
    ctx.closePath();
    ctx.fillStyle = seg.fillStyle || "#ccc";
    ctx.fill();
    ctx.strokeStyle = wheelStrokeStyle;
    ctx.lineWidth = w >= 500 ? 1 : 1.25;
    ctx.stroke();
    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(start+sliceAngle/2);
    ctx.fillStyle = seg.textFillStyle || "#000";
    var fit = fitWheelSectorText(ctx, seg.text || "", innerRadius, outerRadius, sliceAngle, startFont);
    ctx.font = fit.fontSize + "px Inter, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (var li = 0; li < fit.lines.length; li++) {
      var offY = (li - (fit.lines.length - 1) / 2) * fit.lineHeight;
      ctx.fillText(fit.lines[li], fit.rLabel, offY);
    }
    ctx.restore();
  }
}

function getPrizeAngle(sections) {
  var total = 0;
  for (var i=0;i<sections.length;i++) total += sections[i].chanse||0;
  if (total<=0) total=1;
  var r = Math.random()*total;
  var acc=0, idx=0;
  for (var i=0;i<sections.length;i++) {
    acc += sections[i].chanse||0;
    if (r<=acc) { idx=i; break; }
  }
  winningSegmentIndex = idx;
  var per = 360/sections.length;
  var delta = per*0.1;
  var minInSegment = delta;
  var maxInSegment = per-delta;
  var pointerAngle = 0;
  var inSegment = minInSegment + Math.random()*(maxInSegment-minInSegment);
  var stop = pointerAngle + 90 - (idx*per) - inSegment;
  stop = ((stop%360)+360)%360;
  return Math.floor(stop);
}

function easeOutCubic(t){ return 1-Math.pow(1-t,3); }

function animate() {
  if (!animating) return;
  var elapsed = Date.now()-spinStart;
  var progress = Math.min(1, elapsed/spinDuration);
  var eased = easeOutCubic(progress);
  currentRotation = (targetRotation * eased) * (Math.PI/180);
  drawWheel();
  if (progress>=1) {
    animating = false;
    winPrizeSuccess();
  } else {
    requestAnimationFrame(animate);
  }
}

function winPrizeSuccess() {
  var seg = winWheelSegments[winningSegmentIndex];
  document.querySelector("#form-thank .cqp__text-h1").textContent = (seg && (seg.text || seg.eventText)) ? (seg.text || seg.eventText) : "";
  document.querySelector("#form-thank .cqp__text").textContent = (seg&&seg.finishText) ? seg.finishText : wheelSettings.finishText;
  form.classList.add("hidden");
  formThank.classList.remove("hidden");
  var event = (seg && seg.eventName && String(seg.eventName).trim()) ? String(seg.eventName).trim() : (cqpopup_name + " - " + (seg ? (seg.eventText || seg.text) : "prize"));
  carrotquest.track(event);
  carrotquest.identify([{op:"update_or_create",key:"Колесо фортуны приз",value: seg?(seg.eventText||seg.text):""}]);
}

function applyPreview(data) {
  if (!data || data.type !== "WHEEL_PREVIEW_UPDATE") return;
  var elTheme = document.getElementById("cq-preview-theme");
  if (elTheme) elTheme.textContent = data.themeCss || "";
  popup = data.popup;
  cqpopup_name = popup.cqpopup_name || "";
  winWheelSegments = data.winWheelSegments || [];
  pins = data.pins || {};
  animation = data.animation || {};
  wheelSettings = data.wheelSettings || {};
  wheelStrokeStyle = data.wheelStroke || "#fff";
  document.getElementById("pv-form-h1").textContent = popup.title ? popup.title.text : "";
  document.getElementById("pv-form-text").textContent = popup.text ? popup.text.text : "";
  document.getElementById("pv-submit").textContent = popup.button ? popup.button.text : "";
  var inName = document.getElementById("pv-in-name");
  var inEmail = document.getElementById("pv-in-email");
  var inPhone = document.getElementById("pv-in-phone");
  function vis(el, on, ph, req) {
    el.classList.toggle("hidden", !on);
    el.disabled = !on;
    el.placeholder = ph || "";
    if (on && req) el.setAttribute("required","required"); else el.removeAttribute("required");
  }
  if (popup.name) vis(inName, !!popup.name.active, popup.name.placeholder, popup.name.required);
  if (popup.phone) vis(inPhone, !!popup.phone.active, popup.phone.placeholder, popup.phone.required);
  if (popup.email) vis(inEmail, !!popup.email.active, popup.email.placeholder, popup.email.required);
  document.getElementById("pv-thank-h1").textContent = popup.titleThanks ? popup.titleThanks.text : "";
  document.getElementById("pv-thank-text").textContent = popup.textThanks ? popup.textThanks.text : "";
  formThank.classList.add("hidden");
  form.classList.remove("hidden");
  var sub = document.querySelector("[type=submit]");
  if (sub) sub.disabled = false;
  currentRotation = 0;
  targetRotation = 0;
  animating = false;
  syncCanvasSize();
  drawWheel();
}
window.addEventListener("resize", function(){ syncCanvasSize(); drawWheel(); });

window.addEventListener("message", function(e) {
  if (!e.data || e.data.type !== "WHEEL_PREVIEW_UPDATE") return;
  applyPreview(e.data);
});

window.addEventListener("resize", function() {
  syncCanvasSize();
  drawWheel();
});

document.querySelectorAll(".cqp__close, .cqp__bg, .close_btn").forEach(function(el){
  el.addEventListener("click", carrotquest.close);
});

form.addEventListener("submit", function(e) {
  e.preventDefault();
  var data = [];
  if (popup.name&&popup.name.active) {
    var el = form.querySelector("[name=name]");
    if (el) data.push({op:"update_or_create",key:"$name",value:el.value});
  }
  if (popup.phone&&popup.phone.active) {
    var el = form.querySelector("[name=phone]");
    if (el) data.push({op:"update_or_create",key:"$phone",value:getNormalizedPhoneValue(el.value)});
  }
  if (popup.email&&popup.email.active) {
    var el = form.querySelector("[name=email]");
    if (el) data.push({op:"update_or_create",key:"$email",value:el.value});
  }
  if (data.length) carrotquest.identify(data);
  carrotquest.replied();
  carrotquest.track("wheel popup");
  var stopAngle = getPrizeAngle(winWheelSegments);
  targetRotation = spinSpins*360 + stopAngle;
  spinStart = Date.now();
  animating = true;
  document.querySelector("[type=submit]").disabled = true;
  requestAnimationFrame(animate);
});

attachPhoneMask(document.getElementById("pv-in-phone"));

syncCanvasSize();
drawWheel();
</script>
</body>
</html>`

/** Генерирует popupContent (HTML внутри iframe) без сторонних библиотек. */
function buildPopupContent(config: WidgetConfig): string {
  const popup = buildPopupConfig(config)
  const winWheelSegments = buildWinWheelSegments(config)
  const palette = getPalette(config.theme.mode)
  const accent = config.buttonColor || config.theme.accent || palette.primary
  const themeCss = buildWheelPreviewThemeCss(config)
  const wheelStroke = config.theme.mode === 'dark' ? '#595959' : '#fff'

  const pins = { number: 0, outerRadius: 1, lineWidth: 1, margin: 7, fillStyle: accent, strokeStyle: '#fff' }
  const animation = { type: 'spinToStop', duration: 10, spins: 9, stopAngle: null, callbackFinished: 'winPrizeSuccess()' }
  const wheelSettings = {
    canvasId: 'canvas',
    drawMode: 'code',
    imageOverlay: false,
    strokeStyle: null,
    numSegments: winWheelSegments.length,
    pointerAngle: 0,
    textDirection: 'reversed',
    textFontFamily: 'Inter',
    textFontSize: 16,
    textMargin: 20,
    textAlignment: 'center',
    finishTitle: popup.titleThanks.text,
    finishText: popup.textThanks.text,
    segments: winWheelSegments,
    pins,
    animation,
  }

  // Формируем поля формы по конфигу
  const fields: string[] = []
  if (popup.name.active) {
    const req = popup.name.required ? 'required' : ''
    fields.push(`<input type="text" name="name" class="cqp__input" placeholder="${popup.name.placeholder}" ${req}>`)
  }
  if (popup.phone.active) {
    const req = popup.phone.required ? 'required' : ''
    fields.push(`<input type="tel" name="phone" class="cqp__input" placeholder="${popup.phone.placeholder}" ${req}>`)
  }
  if (popup.email.active) {
    const req = popup.email.required ? 'required' : ''
    fields.push(`<input type="email" name="email" class="cqp__input" placeholder="${popup.email.placeholder}" ${req} pattern="\\S+@\\S+\\.\\S+">`)
  }

  const formFieldsHtml = fields.join('\n          ')

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="ie=edge">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
${themeCss}
</style>
</head>
<body>
<div class="cqp__bg bg_open"></div>
<div class="wrapper__body d_flex">
<div class="cqp__body d_flex open">
<a class="cqp__close"></a>
<div class="content-img">
<div class="pointer" aria-hidden="true"></div>
<canvas id="canvas" width="500" height="500">Canvas not supported.</canvas>
</div>
<div class="content-wrap d_flex">
<form action="javascript:void(0)" id="form" class="cqp__form d_flex flex_col">
<p class="cqp__text-h1">${escHtml(popup.title.text)}</p>
<p class="cqp__text">${escHtml(popup.text.text)}</p>
${formFieldsHtml}
<button type="submit" class="cqp__button">${escHtml(popup.button.text)}</button>
</form>
<section id="form-thank" class="cqp__form d_flex flex_col hidden">
<p class="cqp__text-h1">${escHtml(popup.titleThanks.text)}</p>
<p class="cqp__text">${escHtml(popup.textThanks.text)}</p>
<button type="button" class="cqp__button close_btn">Закрыть</button>
</section>
</div>
</div>
</div>
<script>
var popup = ${JSON.stringify(popup)};
var cqpopup_name = popup.cqpopup_name;
var winWheelSegments = ${JSON.stringify(winWheelSegments)};
var pins = ${JSON.stringify(pins)};
var animation = ${JSON.stringify(animation)};
var wheelSettings = ${JSON.stringify(wheelSettings)};

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var canvasDpr = 1;
var logicalWidth = 500;
var logicalHeight = 500;
var outerRadius = 234;
var innerRadius = 40;

function syncCanvasSize() {
  canvasDpr = Math.max(window.devicePixelRatio || 1, 1);
  var mobileWheelSizeCss = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--cq-mobile-wheel-size"), 10);
  var mobileWheelSize = Number.isFinite(mobileWheelSizeCss) ? mobileWheelSizeCss : 315;
  if (window.innerWidth > 1007) {
    logicalWidth = 500;
    logicalHeight = 500;
    outerRadius = 234;
    innerRadius = 40;
  } else {
    logicalWidth = mobileWheelSize;
    logicalHeight = mobileWheelSize;
    outerRadius = Math.round(logicalWidth * 0.476);
    innerRadius = Math.round(logicalWidth * 0.08);
  }
  canvas.style.width = logicalWidth + "px";
  canvas.style.height = logicalHeight + "px";
  canvas.width = Math.round(logicalWidth * canvasDpr);
  canvas.height = Math.round(logicalHeight * canvasDpr);
  ctx.setTransform(canvasDpr, 0, 0, canvasDpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  if (typeof ctx.imageSmoothingQuality !== "undefined") ctx.imageSmoothingQuality = "high";
}

var carrotquest = {
  track: function(n,p){ try{ parent.window.carrotquest.track(n,p); }catch(e){} },
  identify: function(arr){ try{ parent.window.carrotquest.identify(arr); }catch(e){} },
  trackMessageInteraction: function(id,t){ try{ parent.window.carrotquest.trackMessageInteraction(id,t); }catch(e){} },
  animation: function(){ top.postMessage({command:"carrotquest.animationPopup",id:"{{ sending_id }}",cqpopup_name:cqpopup_name},"*"); },
  close: function(){ top.postMessage({command:"carrotquest.closePopup",id:"{{ sending_id }}" },"*"); try{ var f=window.frameElement; if(f&&f.parentNode)f.parentNode.removeChild(f); }catch(e){} },
  replied: function(){ this.trackMessageInteraction("{{ sending_id }}","replied"); this.track("Ответил в попап"); },
  read: function(){ this.trackMessageInteraction("{{ sending_id }}","read"); this.track("Прочитал попап"); }
};
${PHONE_MASK_JS_SOURCE}
${WHEEL_SECTOR_TEXT_JS}
var form = document.getElementById("form");
var formThank = document.getElementById("form-thank");
var currentRotation = 0;
var targetRotation = 0;
var spinStart = 0;
var spinDuration = 10000;
var spinSpins = 9;
var animating = false;
var winningSegmentIndex = 0;

function drawWheel() {
  var w = logicalWidth;
  var h = logicalHeight;
  var cx = w/2;
  var cy = h/2;
  ctx.setTransform(canvasDpr, 0, 0, canvasDpr, 0, 0);
  ctx.clearRect(0,0,w,h);
  var n = winWheelSegments.length;
  if (!n) return;
  var sliceAngle = (2*Math.PI)/n;
  var startFont = w >= 500 ? 16 : 12;
  for (var i=0;i<n;i++) {
    var seg = winWheelSegments[i];
    var start = -Math.PI/2 + currentRotation + i*sliceAngle;
    ctx.beginPath();
    ctx.arc(cx,cy,outerRadius,start,start+sliceAngle);
    ctx.arc(cx,cy,innerRadius,start+sliceAngle,start,true);
    ctx.closePath();
    ctx.fillStyle = seg.fillStyle || "#ccc";
    ctx.fill();
    ctx.strokeStyle = "${wheelStroke}";
    ctx.lineWidth = w >= 500 ? 1 : 1.25;
    ctx.stroke();
    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(start+sliceAngle/2);
    ctx.fillStyle = seg.textFillStyle || "#000";
    var fit = fitWheelSectorText(ctx, seg.text || "", innerRadius, outerRadius, sliceAngle, startFont);
    ctx.font = fit.fontSize + "px Inter, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (var li = 0; li < fit.lines.length; li++) {
      var offY = (li - (fit.lines.length - 1) / 2) * fit.lineHeight;
      ctx.fillText(fit.lines[li], fit.rLabel, offY);
    }
    ctx.restore();
  }
}

function getPrizeAngle(sections) {
  var total = 0;
  for (var i=0;i<sections.length;i++) total += sections[i].chanse||0;
  if (total<=0) total=1;
  var r = Math.random()*total;
  var acc=0, idx=0;
  for (var i=0;i<sections.length;i++) {
    acc += sections[i].chanse||0;
    if (r<=acc) { idx=i; break; }
  }
  winningSegmentIndex = idx;
  var per = 360/sections.length;
  var delta = per*0.1;
  var minInSegment = delta;
  var maxInSegment = per-delta;
  var pointerAngle = 0; // pointer is on the right side
  var inSegment = minInSegment + Math.random()*(maxInSegment-minInSegment);
  var stop = pointerAngle + 90 - (idx*per) - inSegment;
  stop = ((stop%360)+360)%360;
  return Math.floor(stop);
}

function easeOutCubic(t){ return 1-Math.pow(1-t,3); }

function animate() {
  if (!animating) return;
  var elapsed = Date.now()-spinStart;
  var progress = Math.min(1, elapsed/spinDuration);
  var eased = easeOutCubic(progress);
  currentRotation = (targetRotation * eased) * (Math.PI/180);
  drawWheel();
  if (progress>=1) {
    animating = false;
    winPrizeSuccess();
  } else {
    requestAnimationFrame(animate);
  }
}

function winPrizeSuccess() {
  var seg = winWheelSegments[winningSegmentIndex];
  document.querySelector("#form-thank .cqp__text-h1").textContent = (seg && (seg.text || seg.eventText)) ? (seg.text || seg.eventText) : "";
  document.querySelector("#form-thank .cqp__text").textContent = (seg&&seg.finishText) ? seg.finishText : wheelSettings.finishText;
  form.classList.add("hidden");
  formThank.classList.remove("hidden");
  var event = (seg && seg.eventName && String(seg.eventName).trim()) ? String(seg.eventName).trim() : (cqpopup_name + " - " + (seg ? (seg.eventText || seg.text) : "prize"));
  carrotquest.track(event);
  carrotquest.identify([{op:"update_or_create",key:"Колесо фортуны приз",value: seg?(seg.eventText||seg.text):""}]);
}

document.querySelectorAll(".cqp__close, .cqp__bg, .close_btn").forEach(function(el){
  el.addEventListener("click", carrotquest.close);
});

form.addEventListener("submit", function(e) {
  e.preventDefault();
  var data = [];
  if (popup.name&&popup.name.active) {
    var el = form.querySelector("[name=name]");
    if (el) data.push({op:"update_or_create",key:"$name",value:el.value});
  }
  if (popup.phone&&popup.phone.active) {
    var el = form.querySelector("[name=phone]");
    if (el) data.push({op:"update_or_create",key:"$phone",value:getNormalizedPhoneValue(el.value)});
  }
  if (popup.email&&popup.email.active) {
    var el = form.querySelector("[name=email]");
    if (el) data.push({op:"update_or_create",key:"$email",value:el.value});
  }
  if (data.length) carrotquest.identify(data);
  carrotquest.replied();
  carrotquest.track("wheel popup");
  var stopAngle = getPrizeAngle(winWheelSegments);
  targetRotation = spinSpins*360 + stopAngle;
  spinStart = Date.now();
  animating = true;
  document.querySelector("[type=submit]").disabled = true;
  requestAnimationFrame(animate);
});

(function(){ var __phEl = form.querySelector("[name=phone]"); if (__phEl) attachPhoneMask(__phEl); })();

syncCanvasSize();
drawWheel();
window.addEventListener("resize", function(){ syncCanvasSize(); drawWheel(); });
if (document.readyState==="complete") {
  carrotquest.read();
  carrotquest.animation();
} else {
  document.addEventListener("readystatechange", function(){
    if (document.readyState==="complete") { carrotquest.read(); carrotquest.animation(); }
  });
}
</script>
</body>
</html>`
}

/**
 * Генерирует самодостаточный JS-сниппет для вставки в carrotquest.io
 * в качестве триггерного JS-сообщения. Создаёт fullscreen iframe,
 * пишет в него popupContent (HTML+CSS+JS), подставляет значения из config.
 * Без использования сторонних библиотек (WinWheel, GSAP) — колесо на vanilla Canvas.
 */
/** PopupContent с carrotquest-stub для локального превью (не падает без CarrotQuest) */
export function buildPreviewPopupHtml(config: WidgetConfig): string {
  const html = buildPopupContent(config)
  return html.replace('<body>', '<body>\n' + CARROTQUEST_STUB_SCRIPT)
}

export function buildSnippet(config: WidgetConfig): string {
  const popupContent = buildPopupContent(config)

  return `var popup = ${JSON.stringify(buildPopupConfig(config))};
var winWheelSegments = ${JSON.stringify(buildWinWheelSegments(config))};
var animation = {"type":"spinToStop","duration":10,"spins":9,"stopAngle":null,"callbackFinished":"winPrizeSuccess()"};
var pins = {"number":0,"outerRadius":1,"lineWidth":1,"margin":7,"fillStyle":"${(config.buttonColor || config.theme.accent).replace(/"/g, '\\"')}","strokeStyle":"#fff"};
var wheelSettings = {"canvasId":"canvas","drawMode":"code","imageOverlay":false,"strokeStyle":null,"numSegments":winWheelSegments.length,"pointerAngle":0,"textDirection":"reversed","textFontFamily":"Inter","textFontSize":16,"textMargin":20,"textAlignment":"center","finishTitle":popup.titleThanks.text,"finishText":popup.textThanks.text,"segments":winWheelSegments,"pins":pins,"animation":animation};

var popupContent = ${escJsString(popupContent)};

(function(){
  var frameId = 'carrot_frame_{{ sending_id }}';
  var existing = document.getElementById(frameId);
  if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

  var iframe = document.createElement('iframe');
  iframe.id = frameId;
  iframe.frameBorder = 0;
  iframe.style.position = 'fixed';
  iframe.style.left = '0';
  iframe.style.top = '0';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.zIndex = '2147483647';
  iframe.style.transition = 'opacity .2s ease';
  iframe.style.opacity = '0';

  document.body.appendChild(iframe);

  var iframeContent = (iframe.contentWindow || iframe.contentDocument);
  if (iframeContent.document) iframeContent = iframeContent.document;
  iframeContent.open();
  iframeContent.writeln(popupContent);
  iframeContent.close();

  requestAnimationFrame(function(){ iframe.style.opacity = '1'; });

  if (typeof carrotquest !== 'undefined') {
    carrotquest.identify([{op: 'update_or_create', key: 'popup', value: 'opened'}]);
  }
  try { localStorage["cq_popup"] = 'opened'; } catch(e) {}
})();`
}

export function buildPreviewHtml(config: WidgetConfig): string {
  const isDark = config.theme.mode === 'dark'
  const bg = isDark ? '#0B0F19' : '#FFFFFF'
  const text = isDark ? '#E5E7EB' : '#111827'
  const subText = isDark ? '#9CA3AF' : '#6B7280'

  const fieldsHtml = (['name', 'email', 'phone'] as const)
    .filter((f) => config.enabledFields[f])
    .map((f) => {
      const label = f === 'name' ? 'Имя' : f === 'email' ? 'Email' : 'Телефон'
      const type = f === 'email' ? 'email' : f === 'phone' ? 'tel' : 'text'
      const placeholder = f === 'name' ? 'Ваше имя' : f === 'email' ? 'Ваш email' : '+7 (999) 999-99-99'
      return `
        <label class="field">
          <div class="field__label">${label}</div>
          <input class="input" name="${f}" type="${type}" placeholder="${escHtml(placeholder)}" required />
        </label>
      `
    })
    .join('')

  // Те же сегменты, что в сниппете — палитра темы применяется в buildWinWheelSegments.
  const segments = buildWinWheelSegments(config)

  const thankTitle = config.thankYou?.title ?? 'Поздравляем!'
  const thankSubtitle = config.thankYou?.subtitle ?? 'Мы отправили информацию на почту. Если письмо не придет в течение 5 минут, проверьте папку «Спам».'
  const popup = {
    cqpopup_name: config.cqpopupName,
    title: { active: true, text: config.title },
    text: { active: true, text: config.subtitle },
    titleThanks: { active: true, text: thankTitle },
    textThanks: { active: true, text: thankSubtitle },
    button: { text: config.buttonText },
  }

  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escHtml(config.cqpopupName)}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;}
    body{background: transparent; overflow:hidden;}
    .bg{position:fixed;inset:0;background:rgba(0,0,0,.55);}
    .modal{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:20px;}
    .card{width:min(980px,100%);background:${bg};color:${text};border-radius:16px;display:grid;grid-template-columns: 1fr 360px;gap:24px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.35);position:relative;}
    .close{position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:10px;border:1px solid rgba(255,255,255,.15);background:transparent;color:${text};cursor:pointer;}
    .wheelWrap{display:flex;align-items:center;justify-content:center;min-height:520px;position:relative;}
    canvas{border-radius:999px; background: transparent;}
    .pointer{position:absolute;top:6px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:14px solid transparent;border-right:14px solid transparent;border-top:22px solid ${config.buttonColor || config.theme.accent};}
    .side{display:flex;flex-direction:column;gap:12px;align-items:stretch;justify-content:center;}
    .h1{font-size:24px;font-weight:700;line-height:1.15;}
    .p{font-size:14px;line-height:1.4;color:${subText};}
    .field{display:block;}
    .field__label{font-size:12px;color:${subText};margin-bottom:6px;}
    .input{width:100%;height:44px;border-radius:12px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:${text};padding:0 12px;outline:none;}
    .btn{height:46px;border-radius:12px;border:none;background:${config.buttonColor || config.theme.accent};color:#fff;font-weight:700;cursor:pointer;}
    .btn:disabled{opacity:.6;cursor:not-allowed;}
    .thank{display:none;flex-direction:column;gap:10px;}
    @media(max-width: 900px){
      .card{grid-template-columns:1fr; gap:16px;}
      .wheelWrap{min-height:340px;}
    }
  </style>
</head>
<body>
  <div class="bg" id="bg"></div>
  <div class="modal">
    <div class="card">
      <button class="close" id="close" aria-label="Close">✕</button>

      <div class="wheelWrap">
        <div class="pointer"></div>
        <canvas id="canvas" width="420" height="420"></canvas>
      </div>

      <div class="side">
        <form id="form">
          <div class="h1" id="title"></div>
          <div class="p" id="subtitle" style="margin-top:8px"></div>
          <div style="margin-top:14px; display:flex; flex-direction:column; gap:10px">
            ${fieldsHtml}
          </div>
          <button class="btn" id="submit" type="submit" style="margin-top:14px">${escHtml(config.buttonText)}</button>
        </form>

        <div class="thank" id="thank">
          <div class="h1" id="titleThanks"></div>
          <div class="p" id="textThanks"></div>
          <button class="btn" id="close2" type="button">Закрыть</button>
        </div>
      </div>
    </div>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.7.0/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/winwheel@1.0.1/dist/Winwheel.min.js"></script>

  <script>
    const popup = ${JSON.stringify(popup)};
    const winWheelSegments = ${JSON.stringify(segments)};

    const cq = {
      track: (name, params) => {
        try { parent?.window?.carrotquest?.track?.(name, params); } catch(e) {}
        console.log('[track]', name, params || '');
      },
      identify: (arr) => {
        try { parent?.window?.carrotquest?.identify?.(arr); } catch(e) {}
        console.log('[identify]', arr || []);
      },
      close: () => {
        try {
          top.postMessage({ command: "carrotquest.closePopup", id: "{{ sending_id }}" }, "*");
        } catch(e) {}
        try {
          const frameEl = window.frameElement;
          if (frameEl && frameEl.parentNode) frameEl.parentNode.removeChild(frameEl);
        } catch(e) {}
      }
    };

    const titleEl = document.getElementById('title');
    const subtitleEl = document.getElementById('subtitle');
    const titleThanksEl = document.getElementById('titleThanks');
    const textThanksEl = document.getElementById('textThanks');

    titleEl.textContent = popup.title.text;
    subtitleEl.textContent = popup.text.text;
    titleThanksEl.textContent = '';
    textThanksEl.textContent = popup.textThanks.text;

    const canvas = document.getElementById('canvas');
    const theWheel = new Winwheel({
      canvasId: 'canvas',
      numSegments: winWheelSegments.length,
      outerRadius: 200,
      innerRadius: 20,
      textFontFamily: 'Arial',
      textFontSize: 14,
      textAlignment: 'center',
      textMargin: 18,
      pointerAngle: 270,
      segments: winWheelSegments,
      animation: {
        type: 'spinToStop',
        duration: 4,
        spins: 7,
        stopAngle: null,
        callbackFinished: 'winPrizeSuccess()'
      }
    });

    function getPrizeAngle(sections) {
      const total = sections.reduce((a,s)=>a + (s.chanse || 0), 0) || 1;
      const r = Math.random() * total;
      let acc = 0;
      let idx = 0;
      for (let i=0;i<sections.length;i++){
        acc += (sections[i].chanse || 0);
        if (r <= acc) { idx = i; break; }
      }
      const per = 360 / sections.length;
      const delta = per * 0.12;
      const min = per * idx + delta;
      const max = per * (idx + 1) - delta;
      return Math.floor(min + Math.random() * (max - min));
    }

    const form = document.getElementById('form');
    const thank = document.getElementById('thank');
    const submitBtn = document.getElementById('submit');

    function showThank(seg){
      form.style.display = 'none';
      thank.style.display = 'flex';
      titleThanksEl.textContent = seg?.text || seg?.eventText || '';
    }

    window.winPrizeSuccess = function() {
      const seg = theWheel.getIndicatedSegment();
      cq.track(popup.cqpopup_name + " - " + (seg?.eventText || seg?.text || "prize"));
      cq.identify([{ op:"update_or_create", key:"Колесо фортуны приз", value: (seg?.eventText || seg?.text || "") }]);
      showThank(seg);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitBtn.disabled = true;

      const data = [];
      ['name','email','phone'].forEach((k)=>{
        const el = form.querySelector('[name="'+k+'"]');
        if (el && el.value) {
          const key = k === 'name' ? '$name' : k === 'email' ? '$email' : '$phone';
          data.push({ op:'update_or_create', key, value: el.value });
        }
      });
      if (data.length) cq.identify(data);

      theWheel.animation.stopAngle = getPrizeAngle(winWheelSegments);
      theWheel.startAnimation();
    });

    document.getElementById('close').addEventListener('click', cq.close);
    document.getElementById('close2').addEventListener('click', cq.close);
    document.getElementById('bg').addEventListener('click', cq.close);
  </script>
</body>
</html>`
}
