const Recipient = require("mailersend").Recipient;
const EmailParams = require("mailersend").EmailParams;
const MailerSend = require("mailersend").MailerSend;
const Sender = require("mailersend").Sender;
const fs = require('node:fs');
const { subject, message } = require('./data');

(async () => {
    let isVerified;
    const sentFrom = new Sender("info@david-gil.site", "David Gil");
    const data = fs.readFileSync('./emails.txt', 'utf8');
    const splitter = new RegExp('\r?\n');
    const emails = data.split(splitter).filter(email => email.length > 3);
    let remainingEmails;

    const mailersend = new MailerSend({
        apiKey: process.env.API_KEY,
    });

    fs.writeFileSync('./failed-emails.txt', '');

    try {
        const response = await mailersend.email.domain.verify("3z0vkloz8w147qrx");
        isVerified = response.body.message === 'The domain is verified.';
    } catch (e) {
        console.log(`Error verificando el dominio: ${JSON.stringify(e)}`)
    }

    if (!isVerified) return;

    const { body } = await mailersend.others.getApiQuota();
    remainingEmails = body.remaining;

    for (let i = 0; i < emails.length ; i++) {
        if ( remainingEmails <= 0 ) {
            fs.writeFileSync('./failed-emails.txt', 'Ya has alcanzado el limite de mails, prueba en 24h\n');
            fs.writeFileSync('./failed-emails.txt', 'No se pudieron intentar enviar los siguientes emails:\n', { flag: 'a' })
            for (let j = i; j < emails.length ; j++) {
                fs.writeFileSync('./failed-emails.txt', `${emails[j]}\n`, { flag: 'a' });
            }
            return;
        }

        const recipients = [new Recipient(emails[i].trim(), emails[i].substring(0, emails[0].lastIndexOf("@")))];

        const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(subject)
        .setHtml(message)

        try {
            await mailersend.email.send(emailParams);
            console.log(`Email numero ${i + 1} enviado con exito`);
        } catch (e) {
            console.log(`Error enviando el email a ${emails[i]}: ${JSON.stringify(e.body.errors)}`);
            try {
                fs.writeFileSync('./failed-emails.txt', `${emails[i]}\n`, { flag: 'a' })
            } catch(e) {
                console.log("Error guardando email fallido");
            }
        }

        remainingEmails--;
    }
    fs.writeFileSync('./emails.txt', '');
    await new Promise(r => setTimeout(r, 2000));
})()
