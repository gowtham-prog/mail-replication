document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('form').onsubmit = send_mail;
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#detailed-view').style.display ='none';
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}
function send_mail(){
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body : body,
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });
  localStorage.clear();
  load_mailbox('sent');
  return false;
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#detailed-view').style.display ='none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
    fetch (`/emails/${mailbox}`)
    .then (response => response.json())
    .then (emails =>{
     console.log(emails)
     emails.forEach(email=>{show_mail(email,mailbox)})
     if (mailbox==='archived'){
      emails.forEach(email =>{
        if (email.archive){
          show_mail(email,mailbox)
        }
      })
    }

  })
}
function show_mail(mail,mailbox){
   const emaildiv = document.createElement('div')
   emaildiv.className = "list-group-item"
   emaildiv.id = "email-list"
   const recipent = document.createElement('div')
   
   if (mailbox==='sent'){
      mail.recipients.forEach(mail =>{
        recipent.append(`${mail}  `)
      })

   }
   else{
     recipent.innerHTML = mail.sender
   }
   const timestamp = document.createElement('div')
   timestamp.innerHTML= mail.timestamp
   const button = document.createElement('button')
   button.className="btn btn-primary"
   button.innerHTML = 'archive'
   button.id = 'archivebutton'
   const subject= document.createElement('div')
   subject.innerHTML= mail.subject
   recipent.id= "recipent"
   subject.id= "subject2"
   timestamp.id ="timestamp"
   emaildiv.append(recipent)
   emaildiv.append(subject)
   emaildiv.append(timestamp)
   emaildiv.append(button)
  
   
   if(mail.read){
     emaildiv.style.backgroundColor="white"
   }
   else{
    emaildiv.style.backgroundColor="LightGray"
   }
   if (mail.archived){
     button.innerHTML= "Unarchive"
     button.addEventListener('click',event=>{
       unarchive(mail.id,event)
       return false;
     })
   }
   else{
     button.addEventListener('click', event=>{
       archive(mail.id,event)
       return false;
    })
   }
   document.querySelector('#emails-view').append(emaildiv)
  recipent.addEventListener('click',()=>{
    show_detail(mail.id)
  })
  subject.addEventListener('click',()=>{
    show_detail(mail.id)
  })
  timestamp.addEventListener('click',()=>{
    show_detail(mail.id)
  })
  if(mailbox==="sent" ||mail.read){
    var element  = document.querySelector("#archivebutton")
    element.parentNode.removeChild(element)
  }
  
  return false;
  
}


function show_detail(email_id){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#detailed-view').style.display ='block';
  
  fetch(`emails/${email_id}`)
  .then (response => response.json())
  .then(email=>{
    console.log(email)
    document.querySelector('#from').innerHTML = email.sender;
    email.recipients.forEach(index =>{
      document.querySelector('#to').append(`${index}  `);
    })
    document.querySelector('#subject').innerHTML = email.subject;
    document.querySelector('#time').innerHTML = email.timestamp;
    document.querySelector('#body').innerHTML = email.body;
    document.querySelector("#reply").addEventListener('click',()=>{
      reply_mail(email_id)
    })
    read(email_id)
  })
}
function reply_mail(email_id){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#detailed-view').style.display ='none';
  fetch(`emails/${email_id}`)
  .then (response => response.json())
  .then(email=>{
    console.log(email)
    document.querySelector('#compose-recipients').value= `${email.sender}`;
    document.querySelector('#compose-subject').value= `Re: ${email.subject}`;
    document.querySelector('#compose-body').value= `On ${email.timestamp},   ${email.sender} wrote :${email.body}`;
  })
}
function archive(email_id,event){
  hide_element(event)
  fetch(`emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    }) 
  })

}
function unarchive(email_id,event){
  hide_element(event)
  fetch(`emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
window.location.reload();
load_mailbox('inbox');
}
function hide_element(event){
  const element= event.target
  if (element.id==="archivebutton"){
    element.parentElement.style.animationPlayState = 'running';
    
  }
  else{
    alert(`${element.id}`)
  }
  element.parentElement.remove()
}
function read(email_id){
  fetch(`emails/${email_id}`,{
    method: 'PUT',
    body: JSON.stringify({
      read : true
    })
  })
  localStorage(clear)
}