document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('form').onsubmit = function () {
    
    const recipients = document.querySelector('#compose-recipients').value

    const subject = document.querySelector('#compose-subject').value

    const message = document.querySelector('#compose-body').value

    // console.log(recipients)

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: message
      })
      })
      .then(res => res.json())
      .then(emails => {
        console.log(emails)
      })
      .catch(error => {
        console.log(error)
      })
      .finally(() => {
        load_mailbox('sent')
      })
    
    return false
  } 
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  document.querySelector('#emails-view').innerHTML = `
      <h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`
  
  fetch(`/emails/${mailbox}`)
  .then(res => res.json())
    .then(emails=> {

    emails.forEach(email => {
      console.log(email)
      const emailContainer = document.createElement('div')
      emailContainer.classList.add("emails-box", "d-flex", "flex-wrap", "align-items-center", "justify-content-between", "p-2" )
      document.querySelector('#emails-view').append(emailContainer)

      const singleEmail = document.createElement('div')
      singleEmail.classList.add("single-email", "d-flex", "flex-wrap", "align-items-center")
      emailContainer.append(singleEmail)

      const sender = document.createElement('h5')
      sender.innerHTML = email.sender
      sender.classList.add("mb-0", "mr-2")
      singleEmail.append(sender)

      const subject = document.createElement('p')
      subject.innerHTML = email.subject
      subject.classList.add("mb-0")
      singleEmail.append(subject)

      const timeStamp = document.createElement('p')
      timeStamp.innerHTML = email.timestamp
      timeStamp.classList.add("mb-0")
      emailContainer.append(timeStamp)

      emailContainer.classList.add(email.read ? 'read' : 'unread')

      emailContainer.addEventListener('click', ()=>{
        load_email(email.id, mailbox)
      })
    });
  })
  .catch(error => {
    console.log(error);
  });
}

// show selected email
function load_email(emailId, initial_mailbox) {

  // Show single email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';

  document.querySelector('#email-view').style.display = 'block';

  document.querySelector('#email-view').innerHTML = ''

  fetch(`/emails/${emailId}`)
    .then(res => res.json())
    .then(email => {
      const emailContainer = document.createElement('div');
      document.querySelector('#email-view').append(emailContainer);

      const emailDetails = document.createElement('div');
      emailDetails.classList.add('email-Details');
      emailDetails.innerHTML = `
      <p><strong>From: </strong>${email.sender}</p>
      <p><strong>To: </strong>${email.recipients}</p>
      <p><strong>Subject: </strong>${email.subject}</p>
      <p><strong>Timestamp: </strong>${email.timestamp}</p>
      `;
      emailContainer.append(emailDetails);

      const emailBody = document.createElement('div')

      emailBody.classList.add('firstCapitalized')

      emailBody.innerHTML = email.body

      emailContainer.appendChild(emailBody)

      // reply
      const replyBtn = document.createElement('button')

      replyBtn.classList.add("btn","btn-primary", "mr-3")

      replyBtn.innerHTML = 'Reply'

      replyBtn.addEventListener('click', () => {
        compose_email()

        document.querySelector('#compose-recipients').value = email.sender;
        document.querySelector('#compose-subject').value = `${email.subject.includes('Re:') ? email.subject : 'Re: ' + email.subject}`
        
        document.querySelector('#compose-body').value = `\n-------------\n
        On ${email.timestamp} ${email.sender} wrote:
        ${email.body}`;

      })

      emailDetails.appendChild(replyBtn)

      // Archive/unarchive email
      const archiveBtn = document.createElement('button')
      
      if (initial_mailbox === 'sent') {
        archiveBtn.style.display = 'none'
      } else {
        console.log(initial_mailbox)
        archiveBtn.innerHTML = email.archived === true ? 'Unarchive' : 'archive'
        archiveBtn.addEventListener('click', () => {
          fetch(`/emails/${emailId}`, {
            method: 'PUT',
            body: JSON.stringify({
              archived: !email.archived
            })
          }).catch((error) => {
            console.log(error)
          })
          load_mailbox('inbox')
      })
      archiveBtn.classList.add("btn","btn-primary")

      emailDetails.appendChild(archiveBtn)
      
      const divider = document.createElement('hr')

      emailDetails.appendChild(divider)
    }

    // update read
    fetch(`/emails/${emailId}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    }).then()
  })
}