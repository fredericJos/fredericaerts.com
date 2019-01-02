Contact Card
=========================

### Use
```ejs
<% var contactCard = require('@components/contact-card/contact-card.ejs'); %>

<div>
  <%= contactCard({
    avatarSrc: '/img/avatar/avatar.png',
    contactName: 'John Doe',
    email: 'john@doe.com',
    social: [
      {
        iconSrc: '/img/social/linkedin-in.svg',
        brandColor: '#0077b5',
        link: 'https://www.linkedin.com/in/johndoe'
      },
      {
        iconSrc: '/img/social/twitter.svg',
        brandColor: '#1da1f2',
        link: 'https://twitter.com/JohnDoe'
      },
      {
        iconSrc: '/img/social/facebook-f.svg',
        brandColor: '#3b5998',
        link: 'https://www.facebook.com/johndoe'
      }
    ]
  }) %>
</div>
```