"use strict";

let habbits = [];
const HABBIT_KEY = "HABBIT_KEY";
let globalActiveHabbitId;

const page = {
  menu: document.querySelector(".menu__list"),
  header: {
    h1: document.querySelector(".h1"),
    progressPercent: document.querySelector(".progress__percent"),
    progressCoverBar: document.querySelector(".progress__cover-bar"),
  },
  content: {
    daysContainer: document.querySelector("#days"),
    nextDay: document.querySelector(".habbit__day"),
  },
  cover: {
    popup: document.querySelector('.cover'),
    popupClose: document.querySelector('.popup__close')
  },
  iconInput: {
    iconField: document.querySelector('.popup__form input[name="icon"]'),
  }
};

//выгрузка данных
function loadData() {
  const habbitsString = localStorage.getItem(HABBIT_KEY);
  const habbitArray = JSON.parse(habbitsString);
  if (Array.isArray(habbitArray)) {
    habbits = habbitArray;
  }
}
//сохранение данных
function saveData() {
  localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

//валидация форм
function resetForm(form, fields) {
  for (const field of fields) {
    form[field].value = "";
  }
}

function validateAndGetFormData(form, fields) {
  const formData = new FormData(form);
  const res = {};
  for (const field of fields) {
    const fieldValue = formData.get(field);
    form[field].classList.remove("error");
    if (!fieldValue) {
      form[field].classList.add("error");
    }
    res[field] = fieldValue;
  }
  let isValid = true;
  for (const field of fields) {
    if (!res[field]) {
      isValid = false;
    }
  }
  if (!isValid) {
    return;
  }
  return res;
} 


//ререндер
function rerender(activeHabbitId) {
  globalActiveHabbitId = activeHabbitId;

  const activeHabbit = habbits.find((habbit) => habbit.id === activeHabbitId);
  if (!activeHabbit) {
    return;
  }

  document.location.replace(document.location.pathname + '#' + activeHabbitId)


  rerenderMenu(activeHabbit);
  rerenderHead(activeHabbit);
  rerenderContent(activeHabbit);
}

//рендер меню

function rerenderMenu(activeHabbit) {
  page.menu.innerHTML = "";

  for (const habbit of habbits) {
    const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
    if (!existed) {
      //создание
      const element = document.createElement("button");
      element.setAttribute("menu-habbit-id", habbit.id);
      element.classList.add("menu__item");

      //смена активного меню

      element.addEventListener("click", () => {
        rerender(habbit.id);
      });

      element.innerHTML = `<img src="./images/${habbit.icon}.svg" 
      alt="${habbit.name}" />`;
      if (activeHabbit.id === habbit.id) {
        element.classList.add("menu__item_active");
      }
      page.menu.appendChild(element);
      continue;
    }
    if (activeHabbit.id === habbit.id) {
      existed.classList.add("menu__item_active");
    } else {
      existed.classList.remove("menu__item_active");
    }
  }
}

function rerenderHead(activeHabbit) {
  page.header.h1.innerText = activeHabbit.name;
  const progress =
    activeHabbit.days.length / activeHabbit.target > 1
      ? 100
      : (activeHabbit.days.length / activeHabbit.target) * 100;
  page.header.progressPercent.innerText = progress.toFixed(0) + "%";
  page.header.progressCoverBar.setAttribute("style", `width: ${progress}%`);
}

//рендер дней
function rerenderContent(activeHabbit) {
  page.content.daysContainer.innerText = "";
  for (const index in activeHabbit.days) {
    const element = document.createElement("div");
    element.classList.add("habbit");
    element.innerHTML = ` <div class="habbit__day">День ${
      Number(index) + 1
    }</div>
    <div class="habbit__comment">
      ${activeHabbit.days[index].comment}
    </div>
    <button class="habbit__delete" onclick="deleteDays(${index})" >
      <img src="./images/delete.svg" alt="Удалить день ${Number(index) + 1}" />
    </button>`;
    page.content.daysContainer.appendChild(element);
  }
  page.content.nextDay.innerHTML = `День ${activeHabbit.days.length + 1}`;
}



// work with days
function addDays(event) {
  event.preventDefault();

  const form = event.target;

  const data = validateAndGetFormData(event.target, ['comment'])

  if(!data) {
    return
  }

  // //передали форму в formdata, проходится по значениям инпут и ищет по name="comment"
  // const data = new FormData(form);
  // const comment = data.get("comment");
  // form.querySelector(".input_icon").classList.remove("error");

  // if (!comment) {
  //   form.querySelector(".input_icon").classList.add("error");
  // }
  habbits = habbits.map((habbit) => {
    if (habbit.id === globalActiveHabbitId) {
      return {
        ...habbit,
        days: habbit.days.concat([{ comment: data.comment }]),
      };
    }

    return habbit;
  });

  resetForm(event.target, ['comment'])

  //rerender общий
  rerender(globalActiveHabbitId);

  //сохранение в LS
  saveData();
}

//удаление дней
function deleteDays(index) {
  habbits = habbits.map((habbit) => {
    if (habbit.id === globalActiveHabbitId) {
      habbit.days.splice(index, 1);
      return {
      ...habbit, 
      days: habbit.days,
    };
    }
    return habbit;
  });

  rerender(globalActiveHabbitId);
  
  saveData();
}

// скрытие/появление popup окна

function togglePopup(){
  page.cover.popup.classList.toggle('cover_hidden')
}

//работа с привычками

function setIcon(context, icon) {
  page.iconInput.iconField.value = icon
  const activeIcon = document.querySelector('.icon.icon_active')
  activeIcon.classList.remove('icon_active')
  context.classList.add('icon_active')
  console.log(context)
}


//добавление привички

function addHabbit(event) {
  event.preventDefault();

  const data = validateAndGetFormData(event.target, ['name', 'icon', 'target'])

  if(!data) {
    return
  }

  const maxId = habbits.reduce((acc, habbit) => acc> habbit.id ? acc : habbit.id,0 )

  habbits.push({
    id: maxId + 1,
    name: data.name,
    target: data.target,
    icon: data.icon,
    days: [],
  })

  resetForm(event.target, ['name',  'target'])
  togglePopup()
  saveData()
  rerender(maxId + 1)
}


// init
(() => {
  loadData();
})();
(() => {

  const hashId = Number(document.location.hash.replace('#', ""))
  const urlHabbit = habbits.find(habbit => habbit.id == hashId)
  if (urlHabbit) {
    rerender(urlHabbit.id);

  } else {
    rerender(habbits[0].id)
  }
})();
