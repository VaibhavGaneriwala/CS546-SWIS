document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggleAddProduct")
  const formSection = document.getElementById("addProductSection")
  

  if (toggleButton && formSection){
    toggleButton.addEventListener("click", () => {
      formSection.classList.toggle("visible")
    })
  }

  const addProductForm = document.getElementById('addProductForm')
  const errorParagraph = document.getElementById('error')

  function validProductName(name){
    return typeof name === "string" && name.trim().length > 0
  }

  function validCategoryName(name){
    return typeof name === "string" && name.trim().length > 0
  }

  function validQuantity(quantity){
    const num = Number(quantity)
    return Number.isInteger(num) && num >= 1
  }

  function validMinThreshold(minThreshold){
    const num = Number(minThreshold)
    return !isNaN(num) && num >= 0
  }

  function validUnitPrice(unitPrice){
    const num = Number(unitPrice)
    return !isNaN(num) && num >= 0
  }

  function validRestockDate(dateStr){
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
  }


  if (addProductForm){
    addProductForm.addEventListener('submit', async (event) => {
        errorParagraph.innerHTML = ''
        errorParagraph.hidden = true

        const productName = document.getElementById('productName').value.trim()
        const categoryName = document.getElementById('categoryName').value.trim()
        const quantity = document.getElementById('quantity').value
        const minThreshold = document.getElementById('minThreshold').value
        const unitPrice = document.getElementById('unitPrice').value
        const nextRestockDate = document.getElementById('nextRestockDate').value.trim()

        let errorMessages = []

        if (!validProductName(productName)){
            errorMessages.push("Product Name must be a non-empty string")
        }
        if (!validCategoryName(categoryName)){
            errorMessages.push("Category Name must be a non-empty string")
        }
        if (!validQuantity(quantity)){
            errorMessages.push("Quantity must be a non-negative number.")
        }
        if (!validMinThreshold(minThreshold)){
            errorMessages.push("Minimum threshold must be a non-negative number.")
        }
        if (!validUnitPrice(unitPrice)){
            errorMessages.push("Unit price must be a non-negative number.")
        }
        if (!validRestockDate(nextRestockDate)){
            errorMessages.push("Next restock date must be a valid date.")
        }

        if (errorMessages.length > 0){
            event.preventDefault()
            errorParagraph.innerHTML = errorMessages.join(' ')
            errorParagraph.hidden = false
        }
    })
  }
})
