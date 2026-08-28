const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    totalQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

ticketSchema.pre('validate', function () {
  if (this.availableQuantity > this.totalQuantity) {
    this.invalidate('availableQuantity', 'Available quantity cannot exceed total quantity');
  }
});

ticketSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
