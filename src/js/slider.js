/**
 * JavaScript Slider - Easy to use and very flexible.
 * 
 * Link:    https://github.com/wefo-coding/js-slider
 * Author:  Florian Otten
 * Version: 0.1.1
 */

(function (global) {
    
    /*Speichert die auf der Seite auftauchenden Slider als Slider-Objekte.*/
    var sliders = [];
    
    /*Speichert die auf der Seite auftauchenden Slider als DOM-Objekte.*/
    var sliderElements = global.document.getElementsByClassName('wefo-slider');
    
    /*Lade alle Slider.*/
    var i;
    var countSlider = sliderElements.length;
    for (i = 0; i < countSlider; i++){
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
            this.dragX = 0;
            
            /*Touchscreen drag*/
            this.sliderItemsElement.ontouchstart = function(event){
                self.startSlideX = event.touches[0].screenX;
            }
            this.sliderItemsElement.ontouchmove = function(event){
                self.dragX = event.touches[0].screenX - self.startSlideX;
            }
            this.sliderItemsElement.ontouchend = function(event){
                if(self.dragX > 20){
                    self.addItem('ltr');
                }
                else if(self.dragX < -20){
                    self.addItem('rtl');
                }
            }
            this.sliderItemsElement.ontouchcancel = function(event){
                if(self.dragX > 20){
                    self.addItem('ltr');
                }
                else if(self.dragX < -20){
                    self.addItem('rtl');
                }
            }
            
            /*Mouse drag*/
            this.sliderItemsElement.onmousedown = function(event){
                self.startSlideX = event.clientX;
            }
            
            this.sliderItemsElement.onmouseup = function(event){
                self.dragX = event.clientX - self.startSlideX;
                if(self.dragX > 20){
                    self.addItem('ltr');
                }
                else if(self.dragX < -20){
                    self.addItem('rtl');
                }
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
        
        for(var i = this.currentFirst + this.currentCount; i % this.sliderItems.length != this.currentFirst; i++ )
        {
            this.sliderItems[i % this.sliderItems.length].classList.add('notransition'); // Disable transitions
            this.sliderItems[i % this.sliderItems.length].style.left = '100%';
            this.sliderItems[i % this.sliderItems.length].offsetHeight; // Trigger a reflow, flushing the CSS changes
            this.sliderItems[i % this.sliderItems.length].classList.remove('notransition'); // Re-enable transitions
        }
        
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
        return space + 1;
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
        
        console.log(this.canAddItem('ltr'));
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
    
    /**
     * Checks if there is enough space for the next item.
     * 
     * @param {string} [direction='rtl'] The direction of adding the item.
     * 
     * @return {boolean} true if there is enough place to add the next item; otherwise false.
     */
    Slider.prototype.canAddItem = function(direction){
        direction = direction || 'rtl';
        
        if(this.currentCount === this.sliderItems.length){
            return false;
        }
        
        return this.getSpace() >= this.sliderItems[this.nextIndex(direction)].offsetWidth;
    }
    
    /**
     * Returns the index of the first visible Item.
     * 
     * @return {number} Index of the first visible Item.
     */
    Slider.prototype.firstIndex = function(){
        return this.currentFirst;
    }
    
    /**
     * Returns the index of the last visible Item.
     * 
     * @return {number} Index of the last visible Item.
     */
    Slider.prototype.lastIndex = function(){
        return (this.currentFirst + this.currentCount) % this.sliderItems.length;
    }
    
    /**
     * Returns the index of the next Item.
     * 
     * @param {string} [direction='rtl'] The direction of adding the item.
     * 
     * @return {number} Index of the next Item.
     */
    Slider.prototype.nextIndex = function(direction){
        direction = direction || 'rtl';
        
        var first = this.firstIndex(); 
        var countItems = this.sliderItems.length;
        
        if(direction === 'ltr'){
            return first < 0 ? countItems - 1 : (first + countItems - 1) % countItems;
        }
        
        return first < 0 ? 0 : (this.lastIndex() + 1) % countItems;
    }
    
    
    
    /**
     * Invokes the update method of all sliders.
     */
    function updateSliders(){
        var i;
        var countSliders = sliders.length;
        for (i = 0; i < countSliders; i++){
            sliders[i].update();
        }
    }
    
    /*Init*/
    global.onload = updateSliders;
    global.onresize = updateSliders;
}(window));