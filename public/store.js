if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready()
}

function ready() {
    loadItems()
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

    var addToCartButtons = document.getElementsByClassName('shop-item-button')
    for (var i = 0; i < addToCartButtons.length; i++) {
        var button = addToCartButtons[i]
        button.addEventListener('click', addToCartClicked)
    }

    document.getElementsByClassName('btn-purchase')[0].addEventListener('click', purchaseClicked)
}

function loadItems(){
    console.log('starting parse json')
    var items = [];
    fetch('items.json')
        .then(response=> response.json())
        .then(data => {
            addItemsToPage(data)
        })
    return items

}

function addItemsToPage(items){

    var itemsDiv = document.getElementById("items")
    var categories = new Map()

    items.forEach((item) => {
        categories.set(item.type)
    })

    var categoryIter = categories.keys()
    for(var i =0; i < categories.size; i++){
        var categorySection = addItemsToCategory(categoryIter.next(),items)
        itemsDiv.appendChild(categorySection)
    }

}

function addItemsToCategory(key, items){

    var categorySection = document.createElement("section")
    categorySection.id = key.value
    categorySection.className ='shop-category'
    categorySection.innerHTML = `<h2>${key.value}</h2>`
    items.forEach((item) => {
        if(item.type == key.value){
            var itemDiv = document.createElement("div")
            itemDiv.className = 'shop-item'
            itemDiv.id = item.type + '-' + item.brand + '-' + item.name
            var itemInner = `
                        <span class="shop-item-title">${item.name}</span>
                        <img class="shop-item-image" src="${item.img}">
                        <div class="shop-item-details">
                            <span class="shop-item-price">&#x20AC; ${Math.round(item.price)}</span>
                            <button class="btn btn-primary shop-item-button" type="button">ADD TO CART</button>
                        </div>
                    `
            itemDiv.innerHTML = itemInner
            categorySection.appendChild(itemDiv)
        }
    })
    return categorySection
}

function purchaseClicked() {
    var priceElement = document.getElementsByClassName('cart-total-price')[0]
    var price = parseFloat(priceElement.innerText.replace('$', '')) * 100
    stripeHandler.open({
        amount: price
    })
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

function addToCartClicked(event) {
    var button = event.target
    var shopItem = button.parentElement.parentElement
    var title = shopItem.getElementsByClassName('shop-item-title')[0].innerText
    var price = shopItem.getElementsByClassName('shop-item-price')[0].innerText
    var imageSrc = shopItem.getElementsByClassName('shop-item-image')[0].src
    var id = shopItem.dataset.itemId
    addItemToCart(title, price, imageSrc, id)
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
            alert('This item is already added to the cart')
            return
        }
    }
    var cartRowContents = `
        <div class="cart-item cart-column">
            <img class="cart-item-image" src="${imageSrc}" width="100" height="100">
            <span class="cart-item-title">${title}</span>
        </div>
        <span class="cart-price cart-column">${price}</span>
        <div class="cart-quantity cart-column">
            <input class="cart-quantity-input" type="number" value="1">
            <button class="btn btn-danger" type="button">REMOVE</button>
        </div>`
    cartRow.innerHTML = cartRowContents
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