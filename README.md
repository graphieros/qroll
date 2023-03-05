# qroll-scroll

Description...

```
npm i qroll-scroll
```
## DOCUMENTATION
### Wrapper parent

The library targets a parent DIV by its id.
You can provide your own id if you wish.

Wrap all your content into a parent DIV with the id "qroll-parent".
The slides will correspond to the first level DIV children of the parent.
The example below will produce 3 slides:

```
<div id="qroll-parent">
    <div>
        <h1>My first slide</h1>
    </div>

    <div>
        <h2>My Second slide</h2>
    </div>

    <div>
        <h2>My Third slide</h2>
    </div>
</div>
```

Add options to the Parent wrapper using css classes:
- transition duration:
    > "qroll-transition-[duration]" with possible duration values 300, 400, 500, 600, 700, 800, 1000

- show the vertical navigation:
    > "qroll-nav"

- use infinite loop scrolling:
    > "qroll-loop"


```
<div id="qroll-parent" class="qroll-transition-500 qroll-nav qroll-loop">
    <div>
        <h1>My first slide</h1>
    </div>

    <div>
        <h2>My Second slide</h2>
    </div>
    
    <div>
        <h2>My Third slide</h2>
    </div>
</div>
```

### Navigation

The navigation tooltips will try to find the first h1, h2, h3 or h4 element of each slide, to show their text content inside the tooltip. If there are no h1, h2, h3 or h4 element on a slide, the information provided in the tooltip will default to the page index.

You can also customize the content of your tooltips by adding a few data properties to your children divs. In the example below, the first tooltip will use the data-title property, the other tooltips will use the h2 element's content:

```
<div id="qroll-parent" class="qroll-transition-500 qroll-nav qroll-loop">
    <div data-title="my custom name">
        <h1>My first slide</h1>
    </div>

    <div>
        <h2>My Second slide</h2>
    </div>
    
    <div>
        <h2>My Third slide</h2>
    </div>
</div>

```

You can also customize the css of each tooltip, using a data-tooltip-css property:


```
<div id="qroll-parent" class="qroll-transition-500 qroll-nav qroll-loop">
    <div data-title="my custom name" data-tooltip-css="background:blue;color:turquoise;font-weight:bold">
        <h1>My first slide</h1>
    </div>

    <div>
        <h2>My Second slide</h2>
    </div>
    
    <div>
        <h2>My Third slide</h2>
    </div>
</div>
```

### Carousel

Children can become carousels by adding the following css class:

```
<div id="qroll-parent" class="qroll-transition-500 qroll-nav qroll-loop">
    <div class="qroll-carousel qroll-transition-500">
        <div>
            <h2>Carousel slide 1</h2>
        </div>
        <div>
            <h2>Carousel slide 2</h2>
        </div>
        <div>
            <h2>Carousel slide 3</h2>
        </div>
    </div>

    <div>
        <h2>My Second slide</h2>
    </div>
    
    <div>
        <h2>My Third slide</h2>
    </div>
</div>
```

By default, caorusels are not infinite, you can add a css class to make it so:

```
<div id="qroll-parent" class="qroll-transition-500 qroll-nav qroll-loop">
    <div class="qroll-carousel qroll-transition-500 qroll-loop">
        <div>
            <h2>Carousel slide 1</h2>
        </div>
        <div>
            <h2>Carousel slide 2</h2>
        </div>
        <div>
            <h2>Carousel slide 3</h2>
        </div>
    </div>

    <div>
        <h2>My Second slide</h2>
    </div>
    
    <div>
        <h2>My Third slide</h2>
    </div>
</div>
```

You can also customize the tooltip contents and their css, by providing data-title and data-tooltip-css properties to each first level children of your carousel:

```
<div id="qroll-parent" class="qroll-transition-500 qroll-nav qroll-loop">
    <div class="qroll-carousel qroll-transition-500 qroll-loop">
        <div data-title="My custom title 1" data-tooltip-css="font-weight:bold">
            <h2>Carousel slide 1</h2>
        </div>
        <div data-title="My custom title 2">
            <h2>Carousel slide 2</h2>
        </div>
        <div data-title="My custom title 3">
            <h2>Carousel slide 3</h2>
        </div>
    </div>

    <div>
        <h2>My Second slide</h2>
    </div>
    
    <div>
        <h2>My Third slide</h2>
    </div>
</div>
```

### OTHER OPTIONS

#### Progress bar

You can show a progress bar on top of the page that will reflect the current vertical sliding state.

It takes one css class, and one data property if you want to customize its css:

```
<div id="qroll-parent" class="qroll-transition-500 qroll-nav qroll-loop qroll-progress" data-progress-css="background: blue">
   <div>
        <h1>My First slide</h1>
    </div>

    <div>
        <h2>My Second slide</h2>
    </div>
    
    <div>
        <h2>My Third slide</h2>
    </div>
</div>