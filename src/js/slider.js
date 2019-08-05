/**
 * JavaScript Slider - Easy to use and very flexible.
 * 
 * Link:    https://github.com/wefo-coding/js-slider
 * Author:  Florian Otten
 * Version: 0.2.0
 */

(function (global) {
    
    /**
     * Represents a wefo-Slider
     * @constructor
     * 
     * @param {HTMLElement} element - The HTML element of the slider. 
     */
    function Slider(element){
        
        if(!(element instanceof HTMLElement)){
            return;
        }
        
        var self = this;
        
        /* Properties */
        self.element = element;
        self.container = element.getElementsByClassName('wefo-slider-items')[0];
        self.items = [];
        self.first = 0; // Index of first visible item.
        self.lastFirst = 0; //Index of first visible item before the last change.
        self.firstChanged = false;
        self.length = 0; // Number of visible items.
        self.lastLength = 0; // Number of visible items before the last change.
        self.lengthChanged = false;
        self.startSlideX = 0;
        self.dragX = 0;
        
        if(!self.container){
            return;
        }
        
        /* Load slider items */
        var itemElements = self.element.getElementsByClassName('wefo-slider-item');
        for(var i = 0; i < itemElements.length; i++){
            self.items.push(new SliderItem(itemElements[i]));
        }
        
        /* Register button events */
        var leftButtons = self.element.getElementsByClassName('wefo-slider-left');
        for(var i = 0; i < leftButtons.length; i++){
            leftButtons[i].onclick = function(){ self.slide(-1); }
        }
        
        var rightButtons = self.element.getElementsByClassName('wefo-slider-right');
        for(var i = 0; i < rightButtons.length; i++){
            rightButtons[i].onclick = function(){ self.slide(1); }
        }
        
        /*Resize*/
        global.onresize = function(event){
            self.update();
            self.fillRight();
        }

        /*Touchscreen drag*/
        self.container.ontouchstart = function(event){
            self.startSlideX = event.touches[0].screenX;
        }
        self.container.ontouchmove = function(event){
            self.dragX = event.touches[0].screenX - self.startSlideX;
        }
        self.container.ontouchend = function(event){
            if(self.dragX > 20){
                self.slide(-1);
            }
            else if(self.dragX < -20){
                self.slide(1);
            }
        }
        self.container.ontouchcancel = function(event){
            if(self.dragX > 20){
                self.slide(-1);
            }
            else if(self.dragX < -20){
                self.slide(1);
            }
        }

        /*Mouse drag*/
        self.container.onmousedown = function(event){
            self.startSlideX = event.clientX;
        }

        self.container.onmouseup = function(event){
            self.dragX = event.clientX - self.startSlideX;
            if(self.dragX > 20){
                self.slide(-1);
            }
            else if(self.dragX < -20){
                self.slide(1);
            }
        }

        var imgs = self.element.getElementsByTagName('img');
        for (var i=0; i<imgs.length; i++) {
            imgs[i].setAttribute('draggable', 'false');
        }
        
        /* Update */
        self.update();
        self.fillRight();
    }
    
    /**
     * Slides the items by the specified steps.
     * 
     * param {number} steps - Steps to slide.
     */
    Slider.prototype.slide = function(steps){
        
        var self = this;
        
        if(steps === 0 || self.length == self.items.length){
            return;
        }
        steps = steps || 1;
        
        if(!self.firstChanged){
            self.lastFirst = self.first;
            self.firstChanged = true;
        }
        
        if(!self.hasItems()){
            return;
        }
        
        var countItems = self.items.length;
        
        self.first = (self.first + steps) % countItems;
        if(self.first < 0){
            self.first += countItems;
        }
        
        if(steps > 0){
            if(self.length === 0){ // If there is no visible element, start at 0.
                self.first--;
                if(self.first < 0){
                    self.first += countItems;
                }
            }
            self.fillRight();
        }
        else{
            self.fillLeft();
        }
    }
    
    /**
     * Adds as many items as possible from the left hand side to the visible area of the slider.
     */
    Slider.prototype.fillLeft = function(){
        var self = this;
        
        if(!self.firstChanged){
            self.lastFirst = self.first;
            self.firstChanged = true;
        }
        self.lastLength = self.length;
        
        /* hide overflow */
        while(self.getSpace() < 0){
            self.length--;
        }
        
        /* fill space */
        while(self.length < self.items.length && self.getSpace() - self.items[(self.first - 1 + self.items.length) % self.items.length].getWidth() >= 0){
            self.length++;
            self.first = (self.first - 1 + self.items.length) % self.items.length;
        }
        
        self.updatePositions('ltr');
        
        if(self.length == self.items.length){
            console.log("deactivate buttons");
        }
    }
    
    /**
     * Adds as many items as possible from right hand side to the visible area of the slider.
     */
    Slider.prototype.fillRight = function(){
        var self = this;
        
        if(!self.firstChanged){
            self.lastFirst = self.first;
            self.firstChanged = true;
        }
        
        if(!self.lengthChanged){
            self.lastLength = self.length;
            self.lengthChanged = true;
        }
        
        /* hide overflow */
        while(self.getSpace() < 0){
            self.length--;
            self.first = (self.first + 1) % self.items.length;
        }
        
        /* fill space */
        while(self.length < self.items.length && self.getSpace() - self.items[(self.first + self.length) % self.items.length].getWidth() >= 0){
            self.length ++;
        }
        
        self.updatePositions('rtl');
        
        if(self.length == self.items.length){
            console.log("deactivate buttons");
        }
    }
    
    /**
     * Calculates the remaining free space.
     * 
     * @returns {number} free space.
     */
    Slider.prototype.getSpace = function(){
        var self = this;
        
        var space = parseFloat(getComputedStyle(self.container).width);
        
        for(var i = self.first; i < self.first + self.length; i++){
            space -= self.items[i % self.items.length].getWidth();
        }
        
        return space < 0 && space >= -0.5 ? 0 : space;
    }
    
    /**
     * Determines whether the slider has slider items.
     *
     * @returns {boolean} true if the slider contains at least one item.
     */
    Slider.prototype.hasItems = function(){
        return this.items.length !== 0;
    }
    
    /**
     * Determines whether a slider item is currently visible.
     *
     * @param {number} index - Index of the item.
     *
     * @returns {boolean} true if the slider item is visible.
     */
    Slider.prototype.isVisible = function(index){
        var self = this;
        
        for(var i = self.first; i < self.first + self.length; i++){
            if(index === i % self.items.length){
                return true;
            }
        }
    }
    
    /**
     * Determines whether a slider item was visible before last change.
     *
     * @param {number} index - Index of the item.
     *
     * @returns {boolean} true if the slider item was visible before last change.
     */
    Slider.prototype.wasVisible = function(index){
        var self = this;
        
        for(var i = self.lastFirst; i < self.lastFirst + self.lastLength; i++){
            if(index === i % self.items.length){
                return true;
            }
        }
    }
    
    /**
     * Determines whether a slider item or a part of it is in the visible area of the slider.
     * @param {number} index - Index of the item.
     *
     * @returns {boolean} true if the slider item or a part of it is in the visible area.
     */
    Slider.prototype.isInVisibleArea = function(index){
        var self = this;
        var item = this.items[index];
        var x = item.getComputedPosX(), width = item.getWidth(), container = parseFloat(getComputedStyle(self.container).width);
        
        return x + width > 0 && x < container;
    }
    
    /**
     * Recalculates the positions of the sliders items.
     * 
     * @param {string} direction  - Direction of adding items. 'rtl' or 'lrt'.
     */
    Slider.prototype.updatePositions = function(direction){
        direction = direction || 'rtl';
        
        var self = this;
        self.firstChanged = false;
        self.lengthChanged = false;
        
        var countItems = self.items.length;
        var clone = false;
        var index = 0;
        
        if(direction == 'ltr'){
            var index = self.lastFirst - 1;
            var item = null;
            var leftBefore = self.items[self.lastFirst].getComputedPosX();
            var leftAfter = self.getSpace() / 2;
            var firstInvisible = true;
            
            while(index < self.first){
                index += self.items.length;
            }
            
            for(var i = index; i >= self.first; i--){
                index = i % self.items.length;
                item = self.items[index];
                if(self.isVisible(index)){
                    leftBefore -= item.getWidth();
                    item.moveTo(leftBefore, false);
                }
            }
            
            index = self.first;
            
            do{
                item = self.items[index];
                if(!self.isVisible(index)){
                    firstInvisible = false;
                    leftAfter = Math.max( parseFloat(getComputedStyle(self.container).width), leftAfter);
                }
                item.moveTo(leftAfter, self.isVisible(index) || self.isInVisibleArea(index));
                leftAfter += item.getWidth();
                
                index = (index + 1) % self.items.length;
            }
            while(index != self.first);
            
        }
        else{
            var index = self.first;
            var indexHide = (self.first + self.items.length - 1) % self.items.length;
            var item = null;
            var leftBefore = self.items[index].getComputedPosX();
            var leftAfter = self.getSpace() / 2;
            var firstInvisible = true;
            
            do{
                item = self.items[index];
                
                // set start position
                if(!self.isInVisibleArea(index) && firstInvisible){
                    leftBefore = Math.max(parseFloat(getComputedStyle(self.container).width), leftBefore);
                    firstInvisible = false;
                }
                item.moveTo(leftBefore, false);
                leftBefore += item.getWidth();
                
                //set final position
                item.moveTo(leftAfter, true);
                leftAfter += item.getWidth();
                
                index = (index + 1) % self.items.length;
            }
            while(self.isVisible(index) && index != self.first);
            
            if(self.length == self.items.length){
                return;
            }
            
            if(indexHide < index){
                indexHide += self.items.length;
            }
            leftAfter = 0;
            
            for(var i = indexHide; i >= index; i--){
                indexHide = i % self.items.length;
                item = self.items[indexHide];
                
                if(self.isInVisibleArea(indexHide)){
                    leftAfter -= item.getWidth();
                    item.moveTo(leftAfter, true);
                }
            }
        }
    }
    
    /**
     * Updates the slider.
     */
    Slider.prototype.update = function(){
        var self = this;
        
        /* Recalculate slider height. */
        var height = 0;
        for(var i = 0; i < self.items.length; i++){
            height = Math.max(self.items[i].element.offsetHeight, height);
            self.items[i].update();
        }
        self.element.style.height = height + "px";
    }
    
    /**
     * Represents a wefo-Slider Item
     * @constructor
     * 
     * @param {HTMLElement} element - The HTML element of the slider item.
     */
    function SliderItem(element){
        
        if(!(element instanceof HTMLElement)){
            return;
        }
        
        var self = this;
        
        /* Properties */
        self.element = element;
    }
    
    /**
     * Returns the width of the item.
     * 
     * @returns {number} width of item
     */
    SliderItem.prototype.getWidth = function(){
        var self = this;
        return parseFloat(getComputedStyle(self.element).width);
    }
    
    /**
     * Returns the horizontal positon of the item realtive to the slider.
     * 
     * @returns {number} position X
     */
    SliderItem.prototype.getPosX = function(){
        var self = this;
        return parseFloat(self.element.style.left);
    }
    
    /**
     * Returns the computed horizontal positon of the item realtive to the slider.
     * 
     * @returns {number} computed position X
     */
    SliderItem.prototype.getComputedPosX = function(){
        var self = this;
        return parseFloat(getComputedStyle(self.element).left);
    }
    
    /**
     * Updates the slider item.
     */
    SliderItem.prototype.update = function(){
        var self = this;
        
        self.element.style.width = null;
        self.element.style.width = self.getWidth() + "px";
    }
    
    /**
     * Moves an item horizontal.
     *
     * @param {number}  posX        - Horizontal position relative to its slider.
     * @param {boolean} tarnsitions - Use the specified transitions.
     */
    SliderItem.prototype.moveTo = function(posX, transitions){
        posX = posX || 0;
        
        var self = this;
        
        if(!transitions){
            self.element.classList.add('notransition') // Disable transitions
        }
        
        self.element.style.left = posX + "px";
        
        if(!transitions){
            self.element.offsetHeight; // Trigger a reflow, flushing the CSS changes
            self.element.classList.remove('notransition'); // Re-enable transitions
        }
    }
    
    /**
     * Initialization function
     */
    function init(){
        
        /* Load sliders */
        var sliderElements = global.document.getElementsByClassName('wefo-slider');
        for (var i = 0; i < sliderElements.length; i++){
            new Slider(sliderElements[i]);
        }
        
    }
    
    /*global.setInterval(function(){
        var ele = global.document.getElementsByClassName('wefo-slider-item')[0];
        if(ele){
            document.getElementById('jsh').innerHTML = getComputedStyle(ele).left;
        }
    }, 10);*/
    
    
    /* Call init function. */
    global.onload = init;
    
}(window));