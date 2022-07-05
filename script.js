   const hotelBlock = document.querySelector('.hotels__block');
    const villaBlock = document.querySelector('.villas__block');
    const msg = document.querySelector('.msg');
    let hotelCount = 8;
    let villaCount = 8;

    const getData = async () => {
        const result = await fetch('https://docs.google.com/spreadsheets/d/1FUAvYdaRbIkLEk0iH_sFOJx3DddJ5dPNf6LW6SU915s/htmlview')
            .then(res => res.text())
            .then(res => {
                let tableData = [];

                let database = document.createElement('div');
                database.innerHTML = res;
                database.querySelectorAll("a").forEach(el => {
                    el.href = el.href.replace(/https:\/\/www\.google\.com\/url\?q=|&[&a-zA-Z;=0-9\/_-]*/g, '');
                })
                let tabNodes = database.querySelectorAll("#sheet-menu a");
                let tables = database.querySelectorAll('tbody');
                tabNodes.forEach((item, index) => {
                    if (!/[—–−-]/g.test(item.innerText)) {
                        let workObj = {
                            nameTab: item.innerText,
                            data: [],
                        };
                        let trArray = tables[index].querySelectorAll("tr");

                        let category = [];

                        trArray.forEach((item, i) => {
                            let td = item.querySelectorAll("td");

                            if (index === 0) {
                                if (i > 0) {
                                    workObj.data = [...workObj.data, {
                                        name: td[0].innerText,
                                        link: td[1].innerText,
                                        img: td[2].querySelector("img") ? td[2].querySelector("img").src.replace(/=w[0-9]{0,4}-h[0-9]{0,4}/g, "") : false,
                                        filter: td[3].innerText,
                                    }]
                                }
                            }

                            if (index === 1) {
                                if (i > 0) {

                                    if (td.length === 4) {
                                        category = [td[1].innerText];
                                        workObj.data = [...workObj.data, {
                                            name: td[0].innerText,
                                            category: category,
                                            link: td[2].innerText,
                                            img: td[3].querySelector("img") ? td[3].querySelector("img").src.replace(/=w[0-9]{0,4}-h[0-9]{0,4}/g, "") : false,
                                        }]

                                    } else {
                                        category.push(td[0].innerText);
                                    }
                                }
                            }
                        })
                        tableData.push(workObj)
                    }
                })
                console.log(tableData);
                return tableData;
            })
        return result;
    }

    const createPage = async () => {

        const resultData = await getData();
        let hotelTemplate = ``;
        let villaTemplate = ``;
        let filterArr = [];
        let transferArr = [];
        let villasArr = [];
        let filterTemplate = '';


        const createHotelsDefault = async () => {
            resultData.forEach((tab, index) => {
                let { nameTab, data } = tab;
                if (index === 0) {
                    data.forEach(({ name, filter, link, img }, i) => {
                        hotelTemplate += `
                                    <div class="hotel _card" style="background: url(${img})" data-filter="${filter}">
                                        <a href="${link}" target="_blank" class="hotel__bottom _bottom">${name}</a>
                                    </div> `
                    });
                }

                if (index === 1) {
                    data.forEach(({ name, category, link, img }, i) => {
                        villaTemplate += `
                                    <div class="villa__wrapper">
                                    <div class="villa _card" style="background: url(${img})" >
                                        <a href="${link}" target="_blank" class="villa__bottom _bottom">${name}</a>
                                    </div>
                                    <div class="villa__category">
                                        <div class="villa__top">`
                        category.forEach(item => {
                            villaTemplate += `<div class="category__item">&bull; ${item}</div>`
                        })
                        villaTemplate += `
                                    </div>
                                        <a href="${link}" target="_blank" class="hotel__bottom _bottom">${name}</a>
                                    </div>
                                </div>`
                    });
                }
            })
            hotelBlock.innerHTML = hotelTemplate;
            villaBlock.innerHTML = villaTemplate;
        }

        await createHotelsDefault();

        const hotels = document.querySelectorAll('.hotel');
        const villas = document.querySelectorAll('.villa__wrapper');

        addMoreHotelsBtn(hotels, '.hotels__block');
        addMoreHotelsBtn(villas, '.villas__block');


        /***************Фільтр по трансферу***********/
        const dataFilter = document.querySelectorAll('[data-filter]');
        const transferBlock = document.querySelector('.transfer__block');
        let arr1 = [];
        let arr2 = [];
        let transferTemplate = '';

        dataFilter.forEach(el => {
            arr1.push(el.getAttribute('data-filter'));
        });


        for (var i = 0; i < arr1.length; i++) {
            if (arr2.indexOf(arr1[i]) == -1) {
                arr2.push(arr1[i]);
            }
        }

        arr2.forEach((el, i) => {
            transferTemplate += `
                <div class="transfer__item">
                    <input id="t${i}" type="checkbox" class="custom-checkbox ">
                    <label for="t${i}">${el}</label>
            </div>
        `
        })

        transferBlock.innerHTML = transferTemplate;

        /********************************************/

        /***************************************************/
        const renderHotels = () => {
            const hotelsName = document.querySelector('.hotels__name');

            filterTemplate = '';
            let arr = [];
            console.log("filterArr", filterArr);
            console.log("transferArr", transferArr);

            if (filterArr.length === 0) {
                transferArr.forEach(el => arr.push(el));
            } else {
                arr = filterArr.filter((el, i) => transferArr.indexOf(el) !== -1);
            }

            if (transferArr.length === 0) {
                filterArr.forEach(el => arr.push(el));
            }

            if (hotelsName.value.length > 0 && filterArr.length === 0) {
                arr = [];
            }

            console.log("arr", arr);

            arr.forEach(hotel => {
                filterTemplate += hotel.outerHTML;
            })

            addMoreHotelsBtn(arr, '.hotels__block');
        };

        const checkboxes = document.querySelectorAll(".custom-checkbox ");

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                if (checkbox.checked) {
                    hotels.forEach(hotel => {
                        if (hotel.dataset.filter === checkbox.nextElementSibling.innerText
                            && !transferArr.includes(hotel)) {
                            transferArr.push(hotel);
                        }
                    })
                } else {
                    transferArr = transferArr.filter(hotel => hotel.dataset.filter !== checkbox.nextElementSibling.innerText);

                }
                renderHotels();
            })
        });
        /********************************************************************/
        const input1 = document.querySelector(".hotels__name");
        const input2 = document.querySelector(".villas__name");

        input1.oninput = () => {

            let val = input1.value.trim();
            val = val.toLowerCase();
            console.log('value', val)

            if (val != '') {
                const regex = new RegExp(val);
                hotels.forEach(elem => {
                    if (regex.test(elem.innerText.toLowerCase())) {
                        !filterArr.includes(elem) && filterArr.push(elem);
                    } else {
                        filterArr = filterArr.filter(hotel => regex.test(hotel.innerText.toLowerCase()));
                    }
                })
            } else {
                filterArr = [...hotels];
            }

            renderHotels();

        }

        input2.oninput = () => {
            let val = input2.value.trim();
            val = val.toLowerCase();

            if (val != '') {
                const regex = new RegExp(val)
                hotels.forEach(elem => {
                    if (regex.test(elem.innerText.toLowerCase())) {
                        !villasArr.includes(elem) && villasArr.push(elem);
                    } else {
                        villasArr = villasArr.filter(hotel => regex.test(hotel.innerText.toLowerCase()));
                    }
                })
            } else {
                villasArr = [...villas];
            }

            villasTemplate = '';
            villasArr.forEach(hotel => {
                villasTemplate += hotel.outerHTML;
            })

            document.querySelector('.villas__name').innerHTML = villasTemplate;
            addMoreHotelsBtn(villasArr, '.villas__block');
        }

    }

    createPage();


    /************Кнопка "БІЛЬШЕ ГОТЕЛІВ"***********************/
    function addMoreHotelsBtn(array, parentBlock) {

        let template = '';
        let count;

        const parentkWrapper = document.querySelector(parentBlock);
        const blockWrapper = parentkWrapper.closest('.block__wrapper');

        parentkWrapper.matches('.hotels__block') ? count = hotelCount : count = villaCount;

        const hideHotels = () => {
            const hotelsMoreBtn = blockWrapper.querySelector('.hotels__more');
            array.length <= 8 ? hotelsMoreBtn.style.display = "none" : hotelsMoreBtn.style.display = "block";
            array.forEach((el, i) => {
                i > count - 1 ? el.style.display = 'none' : el.style.display = 'flex';
                template += el.outerHTML;
            })
            document.querySelector(parentBlock).innerHTML = (array.length == 0) ? 'Готель не найдено' : template;
        }

        if (blockWrapper.querySelector('.hotels__more') === null) {
            const btn = `<div class="hotels__more" onclick="showMoreHotels(this)">Більше готелів</div>`;
            blockWrapper.innerHTML += btn;
            hideHotels();
        } else {
            hideHotels();
        }
    }

    function showMoreHotels(e) {

        let count;

        const parentElement = e.closest('.block__wrapper');
        const block = parentElement.querySelector('._block');
        const array = block.children;

        block.matches('.hotels__block') ? count = hotelCount : count = villaCount;

        count += 4;

        for (let i = 0; i < array.length; i++) {
            i >= count ? array[i].style.display = 'none' : array[i].style.display = 'flex';
        }

        if (count >= array.length) {
            console.log('-', count, array.length)
            e.innerText = 'Приховать готелі';
            count = 4;
        } else {
            console.log('+', count, array.length)
            e.innerText = 'Більше готелів';
        }
        block.matches('.hotels__block') ? hotelCount = count : villaCount = count;
    }
