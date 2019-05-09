(function (global) {
    
    /*Speichert die auf der Seite auftauchenden Slider als Slider-Objekte.*/
    var sliders = [];
    
    /*Speichert die auf der Seite auftauchenden Slider als DOM-Objekte.*/
    var sliderElements = global.document.getElementsByClassName('wefo-slider');
    
    /*Lade alle Slider.*/
    for (var i = 0; i < sliderElements.length; i++){
        sliders.push(new Slider(sliderElements[i]));
    }
    
    /*Konstruktor-Funktion für einen Slider*/
    function Slider(sliderElement){
        if(sliderElement instanceof HTMLElement){
            var self = this;
            this.sliderElement = sliderElement;
            this.sliderItems = sliderElement.getElementsByClassName('wefo-slider-item');
            this.sliderItemsElement = sliderElement.getElementsByClassName('wefo-slider-items')[0];
            this.currentFirst = -1;
            this.currentCount = 0;
            this.startSlideX = 0;
            
            /*Touchscreen drag*/
            this.sliderItemsElement.ontouchstart = function(event){
                this.startSlideX = event.touches[0].screenX;
            }
            this.sliderItemsElement.ontouchmove = function(event){
                console.log(event.touches[0].screenX - this.startSlideX);
            }
            
            /*Mouse drag*/
            this.sliderItemsElement.onmousedown = function(event){
                this.startSlideX = event.clientLeft;
            }
            this.sliderItemsElement.onmousemove = function(event){
                console.log(event.clientLeft - this.startSlideX);
            }
            
            /*Mouse scroll*/
            
            /*Use Buttons*/
            sliderElement.getElementsByClassName('wefo-slider-left')[0].onclick = function(){
                self.addItem('ltr');
            };
            
            sliderElement.getElementsByClassName('wefo-slider-right')[0].onclick = function(){
                self.addItem('rtl');
            };
        }
    }
    
    /*Update des Slider-Objekts*/
    Slider.prototype.update = function(){
            
        for(var i = 0; i < this.sliderItems.length; i++){
            this.sliderItems[i].style.width = null;
            this.sliderItems[i].style.width = getComputedStyle(this.sliderItems[i]).width
        }
        
        while(this.currentCount < this.sliderItems.length && (this.currentFirst === -1 || this.getSpace() >= this.sliderItems[(this.currentFirst + this.currentCount) % this.sliderItems.length].offsetWidth)){
            this.addItem();
        }
        while(this.getSpace() < 0){
            this.deleteItem('ltr');
        }
        
        this.sliderItemsElement.style.height = this.getMaxItemHeight() + "px";
        this.sliderItemsElement.style.top = (this.sliderElement.offsetHeight - this.sliderItemsElement.offsetHeight) / 2 + "px";
        
        this.updatePositions();
    };
    
    /*Gibt die Höhe des größten Items zurück*/
    Slider.prototype.getMaxItemHeight = function(){
        var max = 0;
        for (var i = 0; i < this.sliderItems.length; i++){
            max = this.sliderItems[i].offsetHeight > max ? this.sliderItems[i].offsetHeight : max;
        }
        return max;
    };
    
    /*Berechnet, wie viel Platz noch verfügbar ist für Items*/
    Slider.prototype.getSpace = function(){
        var space = this.sliderItemsElement.offsetWidth;
        if(this.currentFirst === -1)
            return space;
        for(var i = this.currentFirst; i < this.currentFirst + this.currentCount; i++){
            space -= this.sliderItems[i % this.sliderItems.length].offsetWidth;
        }
        return space == - 1 ? 0 : space;
    };
    
    /*Blendet ein Item von einer bestimmten richtung kommend aus ein.
      Dabei werden so viele Items, wie notwendig aus dem Weg geräumt.*/
    Slider.prototype.addItem = function(direction){
        direction = direction || 'rtl'; //Defaultwert: right-to-left
        var add = this.sliderItems[(direction === 'ltr' ? this.currentFirst === -1 ? this.sliderItems.length - 1 : this.currentFirst + this.sliderItems.length -1 : this.currentFirst === -1 ? 0 : this.currentFirst + this.currentCount) % this.sliderItems.length]; //Das Item, welches eingefügt werden soll
        add.classList.add('notransition'); // Disable transitions
        add.style.left = direction === 'ltr' ? (- add.offsetWidth) + 'px' : this.sliderItemsElement.offsetWidth + 'px';
        add.offsetHeight; // Trigger a reflow, flushing the CSS changes
        add.classList.remove('notransition'); // Re-enable transitions
        add.style.opacity = '1';
        this.currentFirst = direction === 'ltr' ? this.currentFirst === -1 ? this.sliderItems.length - 1 : (this.currentFirst + this.sliderItems.length - 1) % this.sliderItems.length : this.currentFirst === -1 ? 0 : this.sliderItems.length === this.currentCount ? (this.currentFirst + 1) % this.sliderItems.length : this.currentFirst; // ID des neuen ersten Items
        this.currentCount = Math.min(this.currentCount + 1, this.sliderItems.length);
        while(this.getSpace() < 0){
            this.deleteItem(direction);
        }
        this.updatePositions();
    };
    
    /*Blendet ein Item aus.*/
    Slider.prototype.deleteItem = function(direction){
        direction = direction || 'rtl'; //Defaultwert: right-to-left
        this.currentCount--;
        if(direction == 'ltr'){
            this.sliderItems[(this.currentFirst + this.currentCount) % this.sliderItems.length].style.left = Math.round(this.sliderItemsElement.offsetWidth + 1) + 'px';
        }
        else{
            this.sliderItems[this.currentFirst].style.left = (- Math.round(this.sliderItems[this.currentFirst].offsetWidth + 1)) + 'px';
            this.currentFirst = (++this.currentFirst) % this.sliderItems.length;
        }
    }
    
    /*Ordnet die Items neu an.*/
    Slider.prototype.updatePositions = function(){
        if (this.currentFirst === -1)
            return;
        var left = Math.round(this.getSpace() / 2);
        for(var i = this.currentFirst; i < this.currentFirst + this.currentCount; i++){
            this.sliderItems[i % this.sliderItems.length].style.left = left + 'px';
            left += Math.round(this.sliderItems[i % this.sliderItems.length].offsetWidth);
        }
    };
    
    /*Prüft, ob ein weiteres Item eingefügt werden kann.*/
    Slider.prototype.canAddItem = function(direction){
        direction = direction || 'rtl'; //Defaultwert: right-to-left
        /*TODO implement!!*/
    }
    
    /*Führt die update-Methode aller Slider aus.*/
    function updateSliders(){
        for (var i = 0; i < sliders.length; i++){
            sliders[i].update();
        }
    }
    
    /*Initialisierung aller Slider*/
    global.onload = updateSliders;
    global.onresize = updateSliders;
}(window));
