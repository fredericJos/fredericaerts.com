External Link List
=========================

### Use
```ejs
<% var externalLinkList = require('@components/external-link-list/external-link-list.ejs'); %>

<div>
  <%= externalLinkList({
    introText: 'Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus',
    links: [
      {
        text: 'Amet Ornare Mattis Tellus Cras',
        link: 'https://www.nazka.be'
      },
      {
        text: 'Amet Ornare Mattis Tellus Cras',
        link: 'https://www.nazka.be'
      },
      {
        text: 'Amet Ornare Mattis Tellus Cras',
        link: 'https://www.nazka.be'
      }
    ]
  }) %>
</div>
```