function showPage(id) {
    document.querySelectorAll(".page-content").forEach(p => p.classList.remove("active"));
    document.getElementById(id).classList.add("active");

    document.querySelectorAll(".nav-link").forEach(a => a.classList.remove("active"));
    const activeLink = document.querySelector(`.nav-link[data-page="${id}"]`);
    if (activeLink) activeLink.classList.add("active");

    // نستخدم updateCart هنا بدلاً من updateCart() للتأكد من تحديث محتوى السلة عند التبديل للصفحة
    if (id === "cart") updateCart();
}

const products = {
    "Samsung S25": { name:"Samsung Galaxy S25", price:65000, img:"s25.jpeg", category:"phone" },
    "iPhone 17": { name:"iPhone 17 Pro", price:70000, img:"17.jpeg", category:"phone" },
    "Xiaomi Note 15": { name:"Xiaomi Note 15", price:15000, img:"redmi.jpeg", category:"phone" },
    "OnePlus 12": { name:"OnePlus 12", price:40000, img:"one plus.jpeg", category:"phone" },
    "Dell XPS": { name:"Dell XPS 15", price:40000, img:"dell xbx.jpeg", category:"laptop" },
    "Ultrabook": { name:"لابتوب Ultrabook", price:60000, img:"altrua book.jpeg", category:"laptop" },
    "MacBook Air": { name:"MacBook Air M3", price:46000, img:"air.jpeg", category:"laptop" },
    "Gaming Mouse": { name:"ماوس ألعاب احترافي", price:1500, img:"mouse.jpeg", category:"mouse" }
};

function getProductPrice(name) { return products[name] ? products[name].price : 0; }
function getProductImg(name) { return products[name] ? products[name].img : "https://via.placeholder.com/200x200/EEE/000?text=No+Image"; }

function renderProductGrid(containerId, productsToRender) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // تهيئة التنسيق العربي للأسعار
    const priceFormatter = new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', minimumFractionDigits: 0 });

    container.innerHTML = productsToRender.length === 0 ? `<p style="text-align:center; color:#999; padding:20px;">لا توجد منتجات حالياً</p>` :
    productsToRender.map(p => `
        <div class="product-card">
            <img src="${getProductImg(p.key)}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p class="price">${priceFormatter.format(p.price).replace('EGP', 'ج.م')}</p>
            <button class="cta-button" data-product="${p.key}">أضف إلى السلة</button>
        </div>
    `).join("");

    container.querySelectorAll("[data-product]").forEach(btn => btn.onclick = () => addToCart(btn.dataset.product));
}

let cart = [];
function addToCart(productName) {
    const index = cart.findIndex(i=>i.name===productName);
    const price = getProductPrice(productName);
    if(index>-1) cart[index].quantity++; else cart.push({name:productName, price, quantity:1});
    showToast(`✔ تمت إضافة ${products[productName].name} إلى السلة!`); // استخدام الاسم الكامل للمنتج
    updateCart();
}

function updateCart() {
    const container = document.getElementById("cart-items-container");
    if (!container) return;
    
    // تنسيق العملة العربية (ج.م)
    const formatter = new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP', 
        minimumFractionDigits: 2
    });

    container.innerHTML = "";
    if(cart.length===0){ 
        container.innerHTML=`<p style="text-align:center; padding:20px; color:var(--color-primary); font-size:20px;">السلة فارغة</p>`; 
        document.getElementById("total-price").textContent="0.00"; 
        return; 
    }
    
    let total = 0;
    cart.forEach((item,index)=>{
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <div style="display:flex; align-items:center; flex-grow:1;">
                <img src="${getProductImg(item.name)}" alt="${item.name}" style="width:50px;height:50px;margin-left:10px; border-radius: 5px;">
                <span style="font-weight: 500;">${products[item.name].name}</span>
            </div>
            <span style="margin-left: 20px;">${item.quantity} × ${formatter.format(item.price).replace('EGP', 'ج.م')}</span>
            <span style="font-weight:bold; color:var(--color-accent);">${formatter.format(itemTotal).replace('EGP', 'ج.م')}</span>
            <button onclick="removeItem(${index})" style="color:var(--color-accent); background:none; border:none; font-size: 20px; cursor: pointer;">×</button>
        `;
        container.appendChild(div);
    });

    // تطبيق التنسيق العربي على الإجمالي الكلي
    document.getElementById("total-price").textContent = formatter.format(total).replace('EGP', 'ج.م');
    
    // تحديث الإجمالي في صفحة الدفع إذا كانت موجودة
    const finalTotalElement = document.getElementById("final-total-price");
    if (finalTotalElement) {
        finalTotalElement.textContent = formatter.format(total).replace('EGP', 'ج.م');
    }
}

function removeItem(index){ cart.splice(index,1); updateCart(); }

function showCheckout(){ 
    if(cart.length===0) return showToast("❌ السلة فارغة. أضف منتجات أولاً."); 
    showPage("checkout-page"); 
    // يتم تحديث final-total-price تلقائياً داخل updateCart الآن
}

function showToast(msg){
    const toast=document.getElementById("toast-message");
    toast.textContent=msg;
    toast.classList.remove("hide"); toast.classList.add("show");
    setTimeout(()=>{ toast.classList.remove("show"); toast.classList.add("hide"); },2500);
}

document.addEventListener("DOMContentLoaded",()=>{
    const allProducts = Object.keys(products).map(key => ({key, ...products[key]}));
    
    // عرض كل المنتجات في صفحة المتجر
    renderProductGrid("shop-grid", allProducts);

    // عرض الهواتف فقط
    const phones = allProducts.filter(p=>p.category==="phone");
    renderProductGrid("phones-grid", phones);

    // عرض المنتجات الأكثر مبيعًا (أول 4 منتجات كمثال)
    renderProductGrid("homepage-grid", allProducts.slice(0,4));

    // تنشيط روابط التنقل
    document.querySelectorAll(".nav-link[data-page]").forEach(link => {
        link.addEventListener("click", ()=> showPage(link.dataset.page));
    });
    
    // ربط وظيفة showCheckout بزر "متابعة الدفع" في السلة
    const checkoutButton = document.querySelector('#cart .cta-button');
    if (checkoutButton) checkoutButton.onclick = showCheckout;

    // التعامل مع الدفع
    const paymentForm = document.getElementById("payment-form");
    paymentForm.addEventListener("submit", e => {
        e.preventDefault();
        
        // التحقق من أن السلة غير فارغة قبل إظهار رسالة النجاح
        if (cart.length > 0) {
            document.getElementById("payment-success-message").style.display="block";
            paymentForm.style.display = "none"; // إخفاء النموذج
            cart = [];
            updateCart();
            showToast("✅ تم الدفع بنجاح! شكراً لك.");
            
            setTimeout(()=>showPage("homepage"),3000);
        } else {
            showToast("❌ حدث خطأ: لا توجد منتجات لإتمام الدفع.");
        }
    });

    // التأكد من أن الصفحة الرئيسية تظهر عند التحميل
    showPage("homepage");
});