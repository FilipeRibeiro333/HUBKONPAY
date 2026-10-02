jest.mock("nodemailer");

const { sendEmail } = require("../src/utils/email");

describe("envio de email", () => {
  it("envia email com sucesso", async () => {
    const result = await sendEmail("test@test.com", "Teste", "Mensagem");

    expect(result).toBeDefined();
  });
});
