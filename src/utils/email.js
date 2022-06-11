const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendConfirmEmail = (user) => {
    const msg = {
        to: user.email, // Change to your recipient
        from: 'jana.teaching07@gmail.com', // Change to your verified sender
        subject: 'Please confirm your email!',
        html: `
        
        <style>
            .para{
                font-size: 25px;
            }        
        </style>
        
        <p style="color: blue" class="para">
            Welcome, ${user.name}! Please click the below link to confirm your email.
        </p>
        <a href="${process.env.URL_ADDRESS}/confirm_email?userid=${user._id}">Confirm Email</a>
        `,
    }
    
    sgMail.send(msg).then((result) => {
        console.log(result);
    }).catch((e) => {
        console.log(e);
    });
}

module.exports = sendConfirmEmail;