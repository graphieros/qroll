# alpra-scroll

Description...

```
npm i alpra-scroll
```

## why ?

- compatibility with frameworks

## features

- vertical & horizontal
- navigation
- autoplayer
- transition effects

## DOCUMENTATION
### Wrapper parent

The library targets a parent DIV by its id.
Wrap all your content into a parent DIV with the id "alpra-parent".
The slides will correspond to the first level DIV children of the parent.
The example below will produce 3 slides:

```
<div id="alpra-parent">
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
    > "alpra-transition-[duration]" with possible duration values 300, 400, 500, 600, 700, 800, 1000

- show the vertical navigation:
    > "alpra-nav"


```
<div id="alpra-parent" class="alpra-transition-500 alpra-nav">
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

Make sure to add at least one h2 to each of your slides (as pages should only have one h1 element for SEO purposes)