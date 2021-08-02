
//CODE OF CRUD
const LocalStorage = window.localStorage;

export default class ListItem {
  static list = [];

  constructor(description, index = null, completed = false) {
    this.index = index;
    this.description = description;
    this.completed = completed;
  }

  // check if there's elements in localstorage
  static init() {
    if (LocalStorage.getItem('lists')) {
    // if there is elements in the localstorage renders it in the window
      const localStorageArray = Array.from(JSON.parse(LocalStorage.getItem('lists')));
      this.render(localStorageArray);
    } else {
      localStorage.setItem('lists', '[]');
    }
  }

  static addItem(value) {
    const item = new ListItem(value);

    if (localStorage.length > 0) {
      const arrNew = Array.from(JSON.parse(localStorage.getItem('lists')));
      item.index = arrNew.length + 1;
      arrNew.push(item);
      this.setLocalStorage(arrNew);
    } else {
      item.index = 1;
      this.list.push(item);
      this.setLocalStorage(this.list);
    }
  }

  static render(array) {
    const ulElement = document.querySelector('#parent');
    ulElement.innerHTML = '';
    array.forEach((item) => {
      const value = (item.completed === true) ? 'checked' : '';
      const classToShow = (value === 'checked') ? 'text done' : 'text';
      const child = `<div class="container">
                    <li draggable="true">
                      <input id="${item.index}" ${value} type="checkbox" class="check" id="">
                      <input class="${classToShow}" type="text" value="${item.description}">
                      <i class="fas fa-trash-alt"></i>
                      <i class="fas fa-ellipsis-v"></i>
                    </li>
                  </div>`;
      ulElement.innerHTML += child;
    });
  }

  static editItem(index, mssg) {
    const localStorageArray = Array.from(JSON.parse(LocalStorage.getItem('lists')));
    localStorageArray.forEach((item) => {
      if (item.index === index) {
        item.description = mssg;
      }
    });
    this.setLocalStorage(localStorageArray);
  }

  static deleteItem(index) {
    const localStorageArray = Array.from(JSON.parse(LocalStorage.getItem('lists')));
    // delete element that match with the index and saves the array in a new one
    const newArr = localStorageArray.filter((object) => object.index !== index);

    newArr.forEach((object, i) => {
      // giving new index to all elements
      object.index = i + 1;
    });
    this.setLocalStorage(newArr);
  }

  static deleteAllCompleted() {
    const localStorageArray = (LocalStorage.length > 0) ? Array.from(JSON.parse(LocalStorage.getItem('lists'))) : [];
    if (localStorageArray.length > 0) {
      const newArr = localStorageArray.filter((object) => object.completed !== true);
      newArr.forEach((object, i) => {
        // giving new index to all elements
        object.index = i + 1;
      });
      this.setLocalStorage(newArr);
    }
  }

  static resetList() {
    const localStorageArray = (LocalStorage.length > 0) ? Array.from(JSON.parse(LocalStorage.getItem('lists'))) : [];
    if (localStorageArray.length > 0) {
      LocalStorage.clear();
      LocalStorage.setItem('lists', '[]');
    }
  }

  static setLocalStorage(arr) {
    localStorage.clear();
    localStorage.setItem('lists', JSON.stringify(arr));
  }
}
//CODE OF DRAGDROP

import ListItem from './crud.js';

function interchange(newElement, currentElement) {
  const parentDrag = newElement.parentNode;
  const parentOld = currentElement.parentNode;

  parentDrag.appendChild(oldElement);
  parentOld.appendChild(dragItem);
}

function reorderLocalStorage() {
  const elementsLi = document.getElementsByTagName('li');
  const arrElements = Array.from(elementsLi);
  const arrObj = [];

  arrElements.forEach((element) => {
    const obj = {
      index: parseInt(element.firstChild.nextSibling.id, 10),
      description: element.children[1].value,
      completed: element.children[0].checked,
    };
    arrObj.push(obj);
  });

  ListItem.setLocalStorage(arrObj);
}

export default function dragDrop() {
  const elementsLi = document.getElementsByTagName('li');
  const arrElementsLi = Array.from(elementsLi);
  const containersDiv = document.querySelectorAll('.container');
  const arrContainersLi = Array.from(containersDiv);
  let dragItem = null;

  arrElementsLi.forEach((element) => {
    element.addEventListener('dragstart', () => {
      dragItem = element;
    });

    element.addEventListener('dragend', () => {
      dragItem = null;
    });
  });

  arrContainersLi.forEach((container) => {
    container.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    container.addEventListener('dragenter', (e) => {
      e.preventDefault();
    });

    container.addEventListener('drop', (

    ) => {
      interchange(dragItem, container.firstElementChild);
      reorderLocalStorage();
    });
  });
}
//CODE OF INTERACTIONS

import dragDrop from './dragDrop.js';
import ListItem from './crud.js';

const input = document.querySelector('#main-input');

function setLocalStorage(arr) {
  localStorage.clear();
  localStorage.setItem('lists', JSON.stringify(arr));
}

const interactions = {
  init: () => {
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Enter' && e.target.matches('#main-input') && input.value !== '') {
        ListItem.addItem(input.value);
        ListItem.init();
        input.value = '';
      } else if (e.key === 'Enter' && e.target.matches('.text')) {
        const index = parseInt(e.target.parentNode.children[0].id, 10);
        const mssg = e.target.value;
        ListItem.editItem(index, mssg);
      }
      dragDrop();
    });
    interactions.checkCompleteTasks();
    interactions.deleteItem();
  },
  checkCompleteTasks: () => {
    document.addEventListener('change', (e) => {
      const localStorageArray = Array.from(JSON.parse(localStorage.getItem('lists')));
      if (e.target.matches('.check')) {
        const index = parseInt(e.target.id, 10);
        const status = e.path[0].checked;
        if (status) {
          e.path[1].childNodes[3].classList.add('done');
          localStorageArray.forEach((item) => {
            if (item.index === index) { item.completed = true; }
          });
          setLocalStorage(localStorageArray);
        } else {
          e.path[1].childNodes[3].classList.remove('done');
          localStorageArray.forEach((item) => {
            if (item.index === index) { item.completed = false; }
          });
          setLocalStorage(localStorageArray);
        }
      }
    });
  },
  deleteItem: () => {
    document.addEventListener('click', (e) => {
      if (e.target.className === 'fas fa-trash-alt') {
        const index = parseInt(e.target.parentNode.children[0].id, 10);
        // erase the element from the html
        const li = e.target.parentNode;
        const div = li.parentNode;
        const ul = div.parentNode;
        ul.removeChild(div);
        // update the localStorage
        ListItem.deleteItem(index);
      } else if (e.target.matches('#clearAll')) {
        // bring all elements with the class done inside
        const elements = Array.from(document.getElementsByClassName('done'));
        if (elements.length > 0) {
          // delete all of them
          elements.forEach((element) => {
            const li = element.parentNode;
            const div = li.parentNode;
            const ul = div.parentNode;
            ul.removeChild(div);
          });
          // execute function in LS
          ListItem.deleteAllCompleted();
        }
      } else if (e.target.className === 'fas fa-sync') {
        const elements = Array.from(document.getElementsByClassName('container'));

        if (elements.length > 0) {
          // delete all of them
          elements.forEach((element) => {
            const ul = element.parentNode;
            ul.removeChild(element);
          });
          // execute function in LS
          ListItem.resetList();
        }
      }
    });
  },
};

export default interactions;
