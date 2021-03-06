(function() {

const defaultIcon = chrome.runtime.getURL('skin/userscript.png');

chrome.runtime.sendMessage({'name': 'EnabledQuery'}, enabled => {
  document.querySelector('#toggle-global-enabled .icon').textContent
      = enabled ? '\u2611' : '\u2610';
});

chrome.runtime.sendMessage({'name': 'ListUserScripts'}, userScripts => {
  let containerEl = document.querySelector('#user-scripts');
  for (let oldEl of containerEl.querySelectorAll('.user-script')) {
    oldEl.parentNode.removeChild(oldEl);
  }

  userScripts.sort((a, b) => a.name.localeCompare(b.name));

  let empty = true;
  let tplEl = document.querySelector('#templates .user-script > div');
  for (let userScript of userScripts) {
    empty = false;
    let menuEl = tplEl.cloneNode(true);

    if (!userScript.enabled) menuEl.classList.append('disabled');

    let icon = document.createElement('img');
    icon.src = userScript.iconBlob
        ? URL.createObjectURL(userScript.iconBlob)
        : defaultIcon;
    menuEl.querySelector('.icon').appendChild(icon);

    menuEl.querySelector('.name').textContent = userScript.name;
    containerEl.appendChild(menuEl);
  }

  containerEl.style.display = empty ? 'none' : '';
});


window.addEventListener('click', function(event) {
  let el = event.target;

  while (el && el.classList && !el.classList.contains('panel-list-item')) {
    el = el.parentNode;
  }
  if (!el || !el.classList || !el.classList.contains('panel-list-item')) {
    console.warn('monkey menu got click on non-menu item:', event.target);
    window.close();
    return;
  }

  if (el.hasAttribute('data')) {
    chrome.tabs.create({
      'active': true,
      'url': el.getAttribute('data')
    });
  } else switch (el.getAttribute('id')) {
    case 'manage-scripts':
      chrome.tabs.create({
        'url': chrome.runtime.getURL('src/content/manage-user-scripts.html'),
      });
      break;
    case 'toggle-global-enabled':
      chrome.runtime.sendMessage({'name': 'EnabledToggle'});
      break;
    default:
      console.warn('unhandled monkey menu item:', el);
      break;
  }

  window.close();
}, true);

})();
