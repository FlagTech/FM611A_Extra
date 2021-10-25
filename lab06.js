var aio_n = "AIO 使用者名稱";
var aio_k = "AIO_金鑰";
var line_t = "LINE 機器人存取權杖";

var aio_d = 'face';

var keyWords = {
  '打開': 100,
  '開燈': 100,
  '關燈': 0,
  '關閉': 0,
};

function postToAIO(v) {
  var url = 'https://io.adafruit.com/api/v2/' + aio_n + '/feeds/' + aio_d +'/data';
  response = UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'X-AIO-Key': aio_k
    },
    'method': 'post',
    'payload': JSON.stringify({
      'value': v,
    }),
  });
  json_response = JSON.parse(response);
  return json_response;
}

function doGet(e) {
  var returnText;
  var val = e.parameter.val;
  if (val) {
    var r = postToAIO(val);
    if (r.value) {
      returnText = r.value + " OK\n";
    }
    else {
      returnText = "Error: post value\n";
    }
  }
  var textOutput = ContentService.createTextOutput(returnText)
  return textOutput;
}

function doPost(e) {
  var msg = JSON.parse(e.postData.contents);

  // 取出 replayToken 和使用者送出的訊息文字
  var replyToken = msg.events[0].replyToken;
  var userMessage = msg.events[0].message.text;

  if (typeof replyToken === 'undefined') {
    return;
  }

  var returnText;
  var hasKeyword = false;
  var val;

  if (userMessage) {
    for (var k in keyWords) {
      if (userMessage.indexOf(k) !== -1) {
        hasKeyword = true;
        val = keyWords[k];
        break;
      }
    }
  }

  if (hasKeyword) {
    var r = postToAIO(val);
    if (r.value) {
      returnText = "已傳送指令";
    }
    else {
      returnText = "傳送指令出錯";
    }
  }
  else {
    returnText = getMisunderstandWords();
  }

  // returnText = userMessage;
  var url = 'https://api.line.me/v2/bot/message/reply';
  UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + line_t.trim(),
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': [{
        'type': 'text',
        'text': returnText,
      }],
    }),
  });
}


function getMisunderstandWords() {
  var _misunderstandWords = [
    "不好意思，我無法理解您的需求",
    "再說明白一點好嗎？我只是一個不太懂事的 baby 機器人",
    "我不懂您的意思，抱歉我會加強訓練的"
  ];

  if (typeof misunderstandWords === 'undefined') {
    var misunderstandWords = _misunderstandWords;
  }
  else {
    misunderstandWords = misunderstandWords.concat(_misunderstandWords);
  }

  return misunderstandWords[Math.floor(Math.random() * misunderstandWords.length)];
}
