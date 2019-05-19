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
    var sliderElements;
    
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
        
            var imgs = sliderElement.getElementsByTagName('img');
            for (var i=0; i<imgs.length; i++) {
                imgs[i].setAttribute('draggable', 'false');
            }
            
            /*Use Buttons*/
            var leftButtons = sliderElement.getElementsByClassName('wefo-slider-left');
            for(var i = 0; i < leftButtons.length; i++){
                sliderElement.getElementsByClassName('wefo-slider-left')[0].onclick = function(){
                    self.addItem('ltr');
                };
            }
            
            var rightButtons = sliderElement.getElementsByClassName('wefo-slider-right');
            for(var i = 0; i < rightButtons.length; i++){
                sliderElement.getElementsByClassName('wefo-slider-right')[0].onclick = function(){
                    self.addItem('rtl');
                };
            }
        }
    }
    
    /**
     * Updates the slider.
     */
    Slider.prototype.update = function(){
        
        /*recalculate width of slider items*/
        for(var i = 0; i < this.sliderItems.length; i++){
            this.sliderItems[i].style.width = null;
            this.sliderItems[i].style.width = getComputedStyle(this.sliderItems[i]).width
        }
        
        /*recalculate height and vertical positions*/
        this.sliderItemsElement.style.height = this.getMaxItemHeight() + "px";
        this.sliderItemsElement.style.top = (this.sliderElement.offsetHeight - this.sliderItemsElement.offsetHeight) / 2 + "px";
        
        /*fill space*/
        if(this.canAddItem('rtl')){
            this.addItem('rtl');
        }
        
        /*remove overflow*/
        while(this.getSpace() < 0){
            this.deleteItem('ltr');
        }
        
        /*hide unvisible elements to avoid problems on resize*/
        /*Wenn man die Fenstergröße anpasst verändert sich der sichtbare Bereich und versteckte elemente kommen zum Vorschein.*/
        for(var i = this.currentFirst + this.currentCount; i % this.sliderItems.length != this.currentFirst; i++ )
        {
            this.sliderItems[i % this.sliderItems.length].style.opacity = '0';
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
    
    /**
     * Adds an item to the visible area of the slider.
     * If it is necessary visible items will be deleted. If it is possible to add more items, they will be added too.
     * 
     * @param {string} [direction='rtl'] The direction of adding the item.
     */
    Slider.prototype.addItem = function(direction){
        direction = direction || 'rtl'; //Defaultwert: right-to-left
        var newIndex = this.addIndex(direction);
        
        var add = this.sliderItems[newIndex];
        
        //MOVE
        add.classList.add('notransition'); // Disable transitions
        add.style.left = direction === 'ltr' ? (- add.offsetWidth) + 'px' : this.sliderItemsElement.offsetWidth + 'px';
        add.offsetHeight; // Trigger a reflow, flushing the CSS changes
        add.classList.remove('notransition'); // Re-enable transitions
        add.style.opacity = '1';
        
        this.setPreview(newIndex, true);
        
        this.currentFirst = this.nextIndex(direction);
        this.currentCount = Math.min(this.currentCount + 1, this.sliderItems.length);
        
        /*remove overflow*/
        while(this.getSpace() < 0){
            this.deleteItem(direction);
        }
        
        /*fill space*/
        while(this.canAddItem(direction)){
            this.addItem(direction);
        }
        
        this.updatePositions();
    };
    
    /** 
     * Removes an item from the visible area of the slider.
     * 
     * @param {string} [direction='rtl'] The direction of removing the item.
     */
    Slider.prototype.deleteItem = function(direction){
        direction = direction || 'rtl';
        
        if(this.currentCount == 0){
            return;
        }
        
        if(direction === 'ltr'){
            //MOVE
            this.lastItem().style.left = Math.round(this.sliderItemsElement.offsetWidth + 1) + 'px';
            this.setPreview(this.lastIndex(), false)
        }
        else{
            //MOVE
            this.firstItem().style.left = (-Math.round(this.firstItem().offsetWidth + 1)) + 'px';
            this.setPreview(this.firstIndex(), false)
            this.currentFirst = (this.currentFirst + 1) % this.sliderItems.length;
        }
        
        this.currentCount--;
    }
    
    /**
     * Updates the positions of all visible Items.
     */
    Slider.prototype.updatePositions = function(){
        if (this.currentFirst === -1)
            return;
        var left = Math.round(this.getSpace() / 2);
        //MOVE
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
        
        return this.getSpace() >= this.sliderItems[this.addIndex(direction)].offsetWidth;
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
     * Returns the first visible Item.
     * 
     * @return {HTMLElement} First visible Item.
     */
    Slider.prototype.firstItem = function(){
        return this.sliderItems[this.firstIndex()];
    }
    
    /**
     * Returns the index of the last visible Item.
     * 
     * @return {number} Index of the last visible Item.
     */
    Slider.prototype.lastIndex = function(){
        return (this.currentFirst + this.currentCount - 1) % this.sliderItems.length;
    }
    
    /**
     * Returns the last visible Item.
     * 
     * @return {HTMLElement} Last visible Item.
     */
    Slider.prototype.lastItem = function(){
        return this.sliderItems[this.lastIndex()];
    }
    
    /**
     * Returns the index of the next first Item.
     * 
     * @param {string} [direction='rtl'] The direction of adding the item.
     * 
     * @return {number} Index of the next first Item.
     */
    Slider.prototype.nextIndex = function(direction){
        direction = direction || 'rtl';
        
        var first = this.firstIndex(); 
        var countItems = this.sliderItems.length;
        
        if(direction === 'ltr'){
            return first < 0 ? countItems - 1 : (first + countItems - 1) % countItems;
        }
        
        
        return first < 0 ? 0 : countItems === this.currentCount ? (first + 1) % countItems : first;
    }
    
    /**
     * Returns the index of the next Item to add.
     * 
     * @param {string} [direction='rtl'] The direction of adding the item.
     * 
     * @return {number} Index of the next Item to add.
     */
    Slider.prototype.addIndex = function(direction){
        direction = direction || 'rtl';
        
        var countItems = this.sliderItems.length;
        
        if(direction === 'ltr'){
            return this.nextIndex(direction);
        }
        
        if(this.currentCount == 0)
            return 0;
        return (this.currentFirst + this.currentCount) % countItems;
    }
    
    
    /**
     * Returns all previews of an slider item.
     * 
     * @param {number} [index=-1]    Index of the item.
     * @param {bool}   [active=true] Activate or deactivate.
     */
    Slider.prototype.setPreview = function(index, active){
        index = index || (index === 0 ? 0 : -1);
        
        var previewContainers = this.sliderElement.getElementsByClassName('wefo-slider-previews');
        var tmpPreview;
        for(var i = 0; i < previewContainers.length; i++){
            tmpPreview = previewContainers[i].getElementsByClassName('wefo-slider-preview')[index];
            if(tmpPreview){
                if(active){
                    tmpPreview.classList.add('active');
                }
                else{
                    tmpPreview.classList.remove('active');
                }
            }
        }
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
    
    function init(){
        sliderElements = global.document.getElementsByClassName('wefo-slider');
    
        /*load sliders*/
        var i;
        var countSlider = sliderElements.length;
        for (i = 0; i < countSlider; i++){
            sliders.push(new Slider(sliderElements[i]));
        }
        
        updateSliders();
        global.onresize = updateSliders;
    }
    
    /*Init*/
    global.onload = init;
}(window));