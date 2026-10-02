module.exports = {
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({
      accepted: ["test@example.com"],
      response: "OK"
    })
  }))
};
