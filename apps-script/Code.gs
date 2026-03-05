var SPREADSHEET_ID = '';
var SHEET_NAME = '시공점 인증 신청';

function doGet() {
  return jsonResponse_({ ok: true, message: 'POST endpoint is active' });
}

function doPost(e) {
  var result;

  try {
    var payload = parsePayload_(e);
    validatePayload_(payload);
    saveToSheet_(payload);

    result = { ok: true, message: '신청이 완료되었습니다. 시트에 저장되었습니다.' };
  } catch (error) {
    result = {
      ok: false,
      message: String(error && error.message ? error.message : error)
    };
  }

  var responseType = String(e && e.parameter && e.parameter.responseType ? e.parameter.responseType : '').toLowerCase();
  if (responseType === 'json') {
    return jsonResponse_(result);
  }

  return htmlBridgeResponse_(result);
}

function parsePayload_(e) {
  var parameter = e && e.parameter ? e.parameter : {};
  var parameters = e && e.parameters ? e.parameters : {};
  var selectedBrands = [];

  if (parameters.brands && parameters.brands.length) {
    selectedBrands = parameters.brands;
  } else if (parameter.brands) {
    selectedBrands = [parameter.brands];
  }

  selectedBrands = selectedBrands
    .map(function(brand) {
      return String(brand || '').trim();
    })
    .filter(function(brand) {
      return brand !== '';
    });

  return {
    submittedAt: new Date(),
    name: String(parameter.name || '').trim(),
    phone: String(parameter.phone || '').replace(/[^0-9]/g, '').slice(0, 11),
    address: String(parameter.address || '').trim(),
    operatingStatus: String(parameter.operatingStatus || '').trim(),
    shopSize: String(parameter.shopSize || '').trim(),
    brands: selectedBrands,
    otherBrand: String(parameter.otherBrand || '').trim(),
    message: String(parameter.message || '').trim(),
    agree1: String(parameter.agree1 || '').trim() !== '',
    agree2: String(parameter.agree2 || '').trim() !== ''
  };
}

function validatePayload_(payload) {
  if (!payload.name || !payload.phone || !payload.address || !payload.operatingStatus || !payload.shopSize || !payload.message) {
    throw new Error('필수값 누락');
  }

  if (payload.brands.length === 0) {
    throw new Error('브랜드 선택 누락');
  }

  if (!payload.agree1 || !payload.agree2) {
    throw new Error('동의 항목 누락');
  }
}

function saveToSheet_(payload) {
  var spreadsheetId = getConfig_('SPREADSHEET_ID', SPREADSHEET_ID);
  var sheetName = getConfig_('SHEET_NAME', SHEET_NAME);
  if (!spreadsheetId) {
    throw new Error('SPREADSHEET_ID 설정이 필요합니다.');
  }

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);

  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      '접수시간',
      '이름',
      '연락처',
      '매장 상세주소',
      '매장운영 여부',
      '매장규모',
      '취급 틴팅 브랜드',
      '기타 브랜드명',
      '기타 요청사항',
      '개인정보 동의',
      '제3자 정보제공 동의'
    ]);
  }

  sheet.appendRow([
    Utilities.formatDate(payload.submittedAt, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'),
    payload.name,
    payload.phone,
    payload.address,
    payload.operatingStatus,
    payload.shopSize,
    payload.brands.join(', '),
    payload.otherBrand,
    payload.message,
    payload.agree1 ? 'Y' : 'N',
    payload.agree2 ? 'Y' : 'N'
  ]);
}

function getConfig_(key, fallbackValue) {
  var value = PropertiesService.getScriptProperties().getProperty(key);
  if (value && String(value).trim() !== '') {
    return String(value).trim();
  }

  return fallbackValue;
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function htmlBridgeResponse_(payload) {
  var bridgePayload = {
    source: 'TINGLA_APPS_SCRIPT',
    ok: payload && payload.ok === true,
    message: String(payload && payload.message ? payload.message : '')
  };

  var encodedPayload = encodeURIComponent(JSON.stringify(bridgePayload));
  var html = [
    '<!doctype html>',
    '<html lang="ko">',
    '<head><meta charset="UTF-8"><title>TINGLA 제출 결과</title></head>',
    '<body>',
    '<script>',
    '(function(){',
    'var payload = JSON.parse(decodeURIComponent("' + encodedPayload + '"));',
    'if(window.parent){',
    'window.parent.postMessage(payload, "*");',
    '}',
    '})();',
    '</script>',
    '</body>',
    '</html>'
  ].join('');

  return HtmlService.createHtmlOutput(html);
}
