
const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true
  },
  senderId: {
    type: String,
    required: true,
    index: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderEmail: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  read: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  deletedBy: [{
    type: String
  }]
}, {
  timestamps: true
});


chatMessageSchema.index({ roomId: 1, timestamp: -1 });
chatMessageSchema.index({ senderId: 1, timestamp: -1 });

chatMessageSchema.methods.toClientFormat = function() {
  return {
    _id: this._id,
    roomId: this.roomId,
    senderId: this.senderId,
    senderName: this.senderName,
    message: this.message,
    messageType: this.messageType,
    read: this.read,
    timestamp: this.timestamp,
    edited: this.edited
  };
};

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;