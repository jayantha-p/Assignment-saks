var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'jayanthatutorials@gmail.com',
        pass: 'JPKjayantha93'
    }
});


async function send_mail(to, subject, body) {
    var mailOptions = {
        from: 'jayanthatutorials@gmail.com',
        to: to,
        subject: subject,
        text: body

    };

    await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return true
        } else {
            return false
        }
    });
}

function send_otp(to, otp) {
    return send_mail(to, 'OTP', 'Your OTP is ' + otp) 
}


function generate_otp() {
    var x = Math.floor((Math.random() * 1000000) + 1);
    return x;
}


module.exports = {
    send_otp: send_otp,
    generate_otp: generate_otp
}