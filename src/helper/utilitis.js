const { notification } = require("antd");

function htmlToStr(text) {
  return text.replace(/<[^>]*>?/gm, '')
}

function notiMentionParser(fullMatch, original, trigger, name, id) {
  let result = `@${name}`
  return result
}
const mentionRegEx = /((.)\[([^[]*)]\(([^(^)]*)\))/gi;
function editReplacer(fullMatch, original, trigger, name, id) {
  // p1 is nondigits, p2 digits, and p3 non-alphanumerics
  let result = `<span class="mention" data-index="${id}" data-denotation-char="@" data-id="${id}" data-value="${name}">
    <span contenteditable="false">
    <span class="ql-mention-denotation-char">@</span>
    ${name}</span>
    </span>`

  return result
}

const parseMentionToEdit = (string) => {

  // p1 is nondigits, p2 digits, and p3 non-alphanumerics
  let result = string.replace(mentionRegEx, editReplacer)
  return result
}


const replaceNodeToMention = (string) => {
  var div = document.createElement('div');
  div.innerHTML = string
  for (const node of div.querySelectorAll(".mention")) {
    console.log(node.getAttribute("data-id"));
    node.outerHTML = `@[${node.getAttribute("data-value")}](${node.getAttribute("data-id")})`
  }

 
  return div.innerHTML
}


function replacerMessage(fullMatch, original, trigger, name, id) {
  // p1 is nondigits, p2 digits, and p3 non-alphanumerics
  let result = `
  <span class="mention"  data-id="${id}" data-value="${name}">
  ${trigger}${name}
  </span>
  `

  return result
}


const replaceMentionToNode = (string) => {
  let result = string.replace(mentionRegEx, replacerMessage)
  return result
}

const parseMentionFromPlainString = (plainMessage) => {
  let message = plainMessage.replace(mentionRegEx, notiMentionParser) || "N/A"
}

const handleMessageNoti = (chat, userId) => {

  window?.electron?.notificationApi.sendNotification(
    {
      title: "ashdg",
      body: "jashgdfsad"
    }
  )

  let plainMessage = htmlToStr(chat?.latestMessage?.content)
  let message = plainMessage.replace(mentionRegEx, notiMentionParser) || "N/A"
  let sender = chat?.latestMessage?.sender?.fullName
  let mentions = plainMessage.match(mentionRegEx)

  if (chat?.isChannel) {
    if (mentions && mentions.length > 0) {
      let ids = mentions?.map(s => s.match(/\(([^()]*)\)/g)[0].replace(/[{()}]/g, ""))
      if (ids && ids.includes('all_member')) {
        window?.electron?.notificationApi.sendNotification(
          {
            title: `${chat?.name}:${sender || ""}`,
            body: message
          }
        )
      } else if (ids.includes(userId)) {
        window?.electron?.notificationApi.sendNotification(
          {
            title: `${chat?.name}:${sender || ""}`,
            body: message
          }
        )
      }
      return { isSent: true }

    } else {
      return { isSent: false }
    }




  } else {
    window?.electron?.notificationApi.sendNotification(
      {
        title: sender,
        body: message
      }
    )

    return { isSent: true }
  }
}


const convertLink=(html)=>{
  let text = html.replaceAll(/<a\b[^>]*>(.*?)<\/a>/ig,"$1")
  // http://, https://, ftp://
  var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

  // www. sans http:// or https://
  var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

  // Email addresses
  var emailAddressPattern = /[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim;

  return text
      .replace(urlPattern, '<a href="$&">$&</a>')
      .replace(pseudoUrlPattern, '$1<a href="http://$2">$2</a>')
      .replace(emailAddressPattern, '<a href="mailto:$&">$&</a>');
}

export {handleMessageNoti,convertLink,parseMentionFromPlainString,parseMentionToEdit,replaceNodeToMention,replaceMentionToNode}