const addButton = document.querySelector('.addButton');
var input = document.querySelector('.input');
const container = document.querySelector('.container');
//var numItem=2; //номер последней записи на сервере

class item{
    constructor(itemName,checkState){
        // Создаем запись div
        this.createDiv(itemName,checkState);
    }
 

    createDiv(itemName,checkState){

        // обертка для записи
        let itemBox = document.createElement('div');
        itemBox.draggable = true; //Разрешим перетаскивание элементов
        itemBox.classList.add('item');
 
        // создаем поле ввода
        let input = document.createElement('input');
        input.value = itemName;
        input.disabled = true;
        input.onchange=function() {
          saveItems();// сохраняем данные контейнера
        };
        input.classList.add('item_input');
        input.type = "text";

        // создаем поле для отметки о выполнении
        let inputCheckBox = document.createElement('input');
        inputCheckBox.type="checkbox";
        inputCheckBox.onchange=function() {
          saveItems();// сохраняем данные контейнера
        };
        inputCheckBox.checked=checkState;

        // создаем кнопку редактирования
        let editButton = document.createElement('button');
        editButton.innerHTML = "Редактировать";
        editButton.classList.add('editButton');

        // создаем кнопку удаления
        let removeButton = document.createElement('button');
        removeButton.innerHTML = "Удалить";
        removeButton.classList.add('removeButton');

        container.appendChild(itemBox);

        itemBox.appendChild(input);         // поле ввода текса
        itemBox.appendChild(inputCheckBox); // пометка о выполнении
        itemBox.appendChild(editButton);    // кнопка редактирования
        itemBox.appendChild(removeButton);  // кнопка удаления

        editButton.addEventListener('click', () => this.edit(input,editButton));

        removeButton.addEventListener('click', () => this.remove(itemBox));

        
        //Добавим реакцию на начало и конец перетаскивания
        //реакция на начало перетаскивания
        container.addEventListener(`dragstart`, (evt) => {
            evt.target.classList.add(`selected`);
           // alert("dragstart"); // проверка сообщение из функции
        })
         //реакция на конец перетаскивания  
        container.addEventListener(`dragend`, (evt) => {
           evt.target.classList.remove(`selected`);
           //alert("dragend"); // проверка сообщение из функции
        });

        const getNextElement = (cursorPosition, currentElement) => {
            // Получаем объект с размерами и координатами
            const currentElementCoord = currentElement.getBoundingClientRect();
            // Находим вертикальную координату центра текущего элемента
            const currentElementCenter = currentElementCoord.y + currentElementCoord.height / 2;
          
            // Если курсор выше центра элемента, возвращаем текущий элемент
            // В ином случае — следующий DOM-элемент
            const nextElement = (cursorPosition < currentElementCenter) ?
                currentElement :
                currentElement.nextElementSibling;
          
            return nextElement;
          };
        
          container.addEventListener(`dragover`, (evt) => {
            evt.preventDefault();
            
            const activeElement = container.querySelector(`.selected`);
            const currentElement = evt.target;
            const isMoveable = activeElement !== currentElement &&
              currentElement.classList.contains(`item`);
          
            if (!isMoveable) {
              return;
            }
            
            // evt.clientY — вертикальная координата курсора в момент,
            // когда сработало событиеы
            const nextElement = getNextElement(evt.clientY, currentElement);
          
            // Проверяем, нужно ли менять элементы местами
            if (
              nextElement && 
              activeElement === nextElement.previousElementSibling ||
              activeElement === nextElement
            ) {
              // Если нет, выходим из функции, чтобы избежать лишних изменений в DOM
              return;
            }            
            container.insertBefore(activeElement, nextElement);            
            saveItems();// сохраняем данные контейнера
          });
    }

    // функция клика по кнопке "Редактировать"
    edit(input,editButton){
        input.disabled = !input.disabled;
        input.disabled?(editButton.innerHTML = "Редактировать"):(editButton.innerHTML = " Блокировать ");        
    }
    // функция клика по кнопке "Удалить"
    remove(item){
        container.removeChild(item);
        saveItems();// сохраняем данные контейнера
    }   
}

function convListToArray(){
  let arr = [];
  
  // Выбираем поля ввода и метки выполнения
  const itemElements = container.querySelectorAll(`input`);
  
  // Перебираем все элементы списка и присваиваем нужное значение
  for (const itemElement of itemElements) {        
    if(itemElement.type==='text')arr.push(itemElement.value);  
    else itemElement.checked?arr.push('true'):arr.push('false');
  }
  return arr; 
}

function saveStorage(arr){
  localStorage.setItem('TODO_List',JSON.stringify(arr));
}

function loadStorage(){
  let arr=(JSON.parse(localStorage.getItem('TODO_List')));
  let count=arr.length/2;
  for (let i = 0; i < count; i++){
    new item(arr.shift(),arr.shift()==='true');
  }
}

function delLastItemServer(){
  var requestURL =  "http://localhost:3000/posts/";
  var request = new XMLHttpRequest();
  request.open('GET', requestURL);
  request.responseType = 'json';
  request.send();
  request.onload = function() {
    var data =request.response;
    var numItem=data[data.length-1].id;    
    console.log('numItem',numItem);
    delServer(numItem);
  }  
}


function getServer(){
  var requestURL =  "http://localhost:3000/posts/";
  var request = new XMLHttpRequest();
  request.open('GET', requestURL);
  request.responseType = 'json';
  request.send();
  request.onload = function() {
    var data =request.response;
    
    let arr=data[data.length-1].items;
    console.log('get_arrServer : ',arr);
    
    let count=arr.length/2;
    containerClear(); // очищаем контейнер
    for (let i = 0; i < count; i++){
      new item(arr.shift(),arr.shift()==='true');
    }    
  } 
  request.onerror = function() { // происходит, только когда запрос совсем не получилось выполнить
    loadStorage(); // считываем данные из локального хранилища
  }; 
}

// очистка контейнера
function containerClear(){
  const itemElements = container.querySelectorAll(`div`);  
  // Перебираем все элементы списка и присваиваем нужное значение
  for (const itemElement of itemElements) { 
    container.removeChild(itemElement);
  }
}

function postServer(){
// объект для отправки
 var listTODO = {
    items: []
  };
  listTODO.items=convListToArray();  
  var json = JSON.stringify(listTODO);
  var request = new XMLHttpRequest();
  request.open("POST", "http://localhost:3000/posts/");
  request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  request.onreadystatechange = function () {
      if (request.readyState == 4 && request.status == 200)
         alert(request.responseText);
  }
  request.send(json);
}

// удаляем данные из JSON server
function delServer(number){  
 
   var requestURL =  "http://localhost:3000/posts/"+number;
   var request = new XMLHttpRequest();
   request.open('DELETE', requestURL);
   request.responseType = 'json';
   request.send();
  }

function check(){
    if(input.value != ""){
        new item(input.value,false);        
        input.value = "";
        //saveStorage(convListToArray());
        saveItems();// сохраняем данные контейнера
    }
}

function saveItems(){
  saveStorage(convListToArray()); // сохраняем на локальном хранилище

  delLastItemServer(); // удаляем последние данные контейнера из JSON server
  postServer(); // сохраняем на JSON server
}

//---- Инициализация ---------
// считываем данные из JSON server
getServer();

addButton.addEventListener('click', check);
window.addEventListener('keydown', (e) => {
    if(e.which == 13){
        check();
    }
})