# wefo-slider
JavaScript Slider - Easy to use and very flexible.

## Install
Download slider.js and slider.css.

## Add files
```html
<link rel="stylesheet" type="text/css" href="[path]/slider.css">
<script src="[path]/slider.js"></script>
```

## Usage
Add a slider by adding the class 'wefo-slider'. You can use as many sliders as you want.
```html
<div class="wefo-slider">
  ...
</div>
```

A slider contains an area for the slider items.
```html
<div class="wefo-slider">
  <div class="wefo-slider-items">
    ...
  </div>
</div>
```

Here you can add the slider items. You can use as many slider items as you want on each slider.
```html
<div class="wefo-slider">
  <div class="wefo-slider-items">
    <div class="wefo-slider-item">A</div>
    ...
    <div class="wefo-slider-item">Z</div>
  </div>
</div>
```
To add controls for slide right or slide left just add the class wefo-slider-left or wefo-slider-right.
```html
<div class="wefo-slider">
  <div class="wefo-slider-left">&lt;</div>
  <div class="wefo-slider-items">
    <div class="wefo-slider-item">A</div>
    ...
    <div class="wefo-slider-item">Z</div>
  </div>
  <div class="wefo-slider-right">&gt;</div>
</div>
```
That's it! You can use your own CSS. Every Item can have different sizes and styles. 

You can also add previews to the slider by adding a new container with previews.
```html
<div class="wefo-slider">
  
  <div class="wefo-slider-left">&lt;</div>
  
  <div class="wefo-slider-items">
    <div class="wefo-slider-item">A</div>
    ...
    <div class="wefo-slider-item">Z</div>
  </div>
  
  <div class="wefo-slider-right">&gt;</div>
  
  <div class="wefo-slider-previews">
    <div class="wefo-slider-preview">A</div>
    ...
    <div class="wefo-slider-preview">Z</div>
  </div>
</div>
```
You can add as many preview containers as you want to each slider.
All items that are visible in the wefo-slider-items area will get a class 'active' on it's preview in the wefo-slider-previews area.
```html
<div class="wefo-slider-preview active">A</div>
```
So you can highlight the previews of visible items.
