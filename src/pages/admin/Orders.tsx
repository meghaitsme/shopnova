import emailjs from '@emailjs/browser';

emailjs.send(
  "service_ylb1445", 
  "template_5idu7lr", 
  {
    title: "Test Inquiry",
    name: "John Doe",
    time: "10:00 AM",
    message: "This is a test message to check the formatting.",
    email: "meghak.krish@gmail.com"
  },
  "enm9N6mcUVaAeB2C-" // <--- Your Public Key
).then((response) => {
    console.log('SUCCESS!', response.status, response.text);
  }, (error) => {
    console.log('FAILED...', error);
  });