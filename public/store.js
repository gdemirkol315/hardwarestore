
loadItems()
document.onload = addListeners()
document.onload = fixHeader()

function addListeners() {
    var removeCartItemButtons = document.getElementsByClassName('btn-danger')
    for (var i = 0; i < removeCartItemButtons.length; i++) {
        var button = removeCartItemButtons[i]
        button.addEventListener('click', removeCartItem)
    }

    var quantityInputs = document.getElementsByClassName('cart-quantity-input')
    for (var i = 0; i < quantityInputs.length; i++) {
        var input = quantityInputs[i]
        input.addEventListener('change', quantityChanged)
    }
    dynamicGoToChartButton()
}


function fixHeader(){
    window.onscroll = function() {stickHeader()};

    var header = document.getElementsByClassName("main-header")[0];
    var sticky = header.offsetTop;

    function stickHeader() {
        if (window.pageYOffset > sticky) {
            header.classList.add("sticky");
        } else {
            header.classList.remove("sticky");
        }
    }
}

function dynamicGoToChartButton(){
    window.addEventListener('scroll',function() {
        checkForGoToCart()
    });
    window.addEventListener('click',function() {
        setTimeout(() => {checkForGoToCart()}, 250);
    });
    function checkForGoToCart(){
        var shoppingCart = document.getElementById("shopping-cart")
        var gotoCartButton = document.getElementById("gotocart")

        if (isInViewport(shoppingCart)) {
            gotoCartButton.style.display = "none";
        } else {
            gotoCartButton.style.display = "block";
        }

        function isInViewport(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }
    }
}

function loadItems() {

    fetch('https://raw.githubusercontent.com/gdemirkol315/hardwarestore/master/public/items.json')
        .then(response => response.json())
        .then(data => {
            addItemsToPage(data)
        })
}

function addItemsToPage(items) {

    var itemsDiv = document.getElementById("accordion")
    var categories = new Map()

    items.forEach((item) => {
        categories.set(item.type)
    })

    var categoryIter = categories.keys()
    for (var i = 0; i < categories.size; i++) {
        var categorySection = addItemsToCategory(categoryIter.next(), items)
        itemsDiv.appendChild(categorySection)
    }

    activatePopOver()
}

function activatePopOver() {
    $('[data-toggle="popover"]').popover();
    setPopOverFadeOut()
}

function setPopOverFadeOut(){
    $('[data-toggle="popover"]').click(function () {
        setTimeout(function () {
            $('.popover').fadeOut('slow');
        }, 1000);
        document.body.addEventListener('click', $('.popover').fadeIn());

    });
}

function addItemsToCategory(key, items) {

    var categoryCard = document.createElement('div')
    categoryCard.className = 'card'

    var categoryButtonHeading = document.createElement('div')

    var categoryCollapse = document.createElement('div')
    categoryCollapse.id = key.value.replaceAll(' ','') + '-collapse'
    categoryCollapse.className = 'collapse'
    categoryCollapse.dataParent = '#accordion'


    var categoryCollapseBody = document.createElement('div')
    categoryCollapseBody.className = 'card-body category ' +
        'row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-left'
    categoryButtonHeading.className = 'card-title'
    categoryButtonHeading.id = key.value.replaceAll(' ','') + '-header'

    categoryButtonHeading.innerHTML =
        `  <h5 class="mb-0">
                <button class="btn btn-link" data-toggle="collapse" data-target="#${categoryCollapse.id}">
                    ${key.value}
                </button>
            </h5>
        `

    categoryCard.appendChild(categoryButtonHeading)

    items.forEach((item) => {
        if (item.type == key.value) {
            var itemDiv = document.createElement("div")
            itemDiv.className = 'shop-item'
            itemDiv.align='center'
            itemDiv.id = (item.type.replaceAll(' ','') + '-' + item.brand + '-' + item.name).replaceAll(' ','')
            itemDiv.innerHTML = `
                        
                        <div class="card card-item">
                        <img class="card-img-top mx-auto shop-item-image" src="${item.img}" alt="item-picture-${item.name}">
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item">
                                    <h1 class="shop-item-title">${item.name}</h1>
                                    <p class="text-center">Brand: ${item.brand}</p>
                                </li>
                                <li class="list-group-item">
                                    ${technicalDetailsButton(item.specs,itemDiv.id)}  
                                </li>
                                <li class="list-group-item">
                                    <h5 class="shop-item-price">$ ${Math.round(item.price * 100) / 100}</h5>
                                    <button class="btn btn-primary" type="button" 
                                    onclick="addToCartClicked(\'`+itemDiv.id+`\')"
                                    data-toggle="popover" data-content="Item added to shopping cart"
                                    data-placement="bottom" data-trigger="focus">ADD TO CART</button>
                                </li>
                            </ul>
                        </div>
                    `
            categoryCollapseBody.appendChild(itemDiv)

        }
    })
    categoryCollapse.appendChild(categoryCollapseBody)
    categoryCard.appendChild(categoryCollapse)
    return categoryCard
}
function technicalDetailsButton(specs, itemId){
    return `<div class="card-title-details-${itemId}">
            <h5 class="mb-0">
                <button class="btn btn-link" data-toggle="collapse" data-target="#details-${itemId}">
                Technical Details
                </button>
            </h5>
        </div>
        <div id="details-${itemId}" class="collapse">
            ${formatSpecs(specs)}    
        </div>`
}

function formatSpecs(specsStr){
    result =''
    specsStr.forEach((spec) => {
        result = result + '<br>' + spec
    })
    return result
}

function removeCartItem(event) {
    var buttonClicked = event.target
    buttonClicked.parentElement.parentElement.remove()
    updateCartTotal()
}

function quantityChanged(event) {
    var input = event.target
    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1
    }
    updateCartTotal()
}

function addToCartClicked(id) {

    var shopItem = document.getElementById(id)
    var title = shopItem.getElementsByClassName('shop-item-title')[0].innerText
    var price = shopItem.getElementsByClassName('shop-item-price')[0].innerText
    var imageSrc = shopItem.getElementsByClassName('shop-item-image')[0].src
    var id2 = shopItem.dataset.itemId
    addItemToCart(title, price, imageSrc, id2)
    updateCartTotal()
}

function addItemToCart(title, price, imageSrc, id) {
    var cartRow = document.createElement('div')
    cartRow.classList.add('cart-row')
    cartRow.dataset.itemId = id
    var cartItems = document.getElementsByClassName('cart-items')[0]
    var cartItemNames = cartItems.getElementsByClassName('cart-item-title')
    for (var i = 0; i < cartItemNames.length; i++) {
        if (cartItemNames[i].innerText == title) {
            cartItemNames[i].parentElement.parentElement.getElementsByClassName("cart-quantity-input")[0].value++
            return
        }
    }
    cartRow.innerHTML = `
        <div class="cart-item cart-column">
            <img class="cart-item-image" src="${imageSrc}" width="100" height="100" alt="${id}">
            <span class="cart-item-title">${title}</span>
        </div>
        <span class="cart-price cart-column">${price}</span>
        <div class="cart-quantity cart-column">
            <input class="cart-quantity-input" type="number" value="1">
            <button class="btn btn-danger" type="button">REMOVE</button>
        </div>`
    cartItems.append(cartRow)
    cartRow.getElementsByClassName('btn-danger')[0].addEventListener('click', removeCartItem)
    cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change', quantityChanged)
}

function updateCartTotal() {
    var cartItemContainer = document.getElementsByClassName('cart-items')[0]
    var cartRows = cartItemContainer.getElementsByClassName('cart-row')
    var total = 0
    for (var i = 0; i < cartRows.length; i++) {
        var cartRow = cartRows[i]
        var priceElement = cartRow.getElementsByClassName('cart-price')[0]
        var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
        var price = parseFloat(priceElement.innerText.replace('$', ''))
        var quantity = quantityElement.value
        total = total + (price * quantity)
    }
    total = Math.round(total * 100) / 100
    document.getElementsByClassName('cart-total-price')[0].innerText = '$' + total
}