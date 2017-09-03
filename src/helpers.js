module.exports = {
  botStarted() {
    console.log('🚀Bot: Has been started...')
  },
  getMessageChatId(msg) {
    return msg.chat.id;
  }
}