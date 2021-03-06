# Fonctional Images

This little laboratory is inspired by Conal Elliot's paper
[Functional Images](http://conal.net/papers/functional-images/)

This is a port in javascript of an old java applet I wrote in 2009, given
that applets are more and more difficult to run in modern browsers.

## TERMINOLOGY

`filab` generates grayscale images, by defining a function (or a series of functions)
 from 2D space to gray level.

To achieve this, a graph is made of modules connected together.

There are 5 types of modules :

* Frame : a module that generates 2D points

* Warp : a module that transforms the 2D points

* Image : a module that converts the 2D points into gray level

* Effect : a module that transforms the gray level

* Display : a module that produces an image

## USAGE

* To add a module to the graph, drag it from the palette (on the left)
to the work space.

* To set a link between two modules, click on one connector and drag a line to another one. Round connectors represent 2D points. Square connectors
represent gray level values. You can only set a link between connectors of the same kind.

* From a bottom connector (producer), you can draw many links.

* A top connector (provider) can receive only one link.

* To remove a link, draw a line from the top connector to nothing.

* To scroll the workspace, click in the background and drag.

* A valid graph must start with at least one Frame module, and end with a Display module. Modules not connected to the graph are ignored.

![config24](config24.png)

* When the graph is ready, click the `Run` button.

## EXPORT

You can export the graph into a json file.

## IMPORT

You can import a json file, by dropping it to from the computer desktop to the workspace.


## SOME RESULTS

* demo 5
![result5](result5.png)

* demo 6
![result6](result6.png)

* demo 7
![result7](result7.png)

* demo 10
![result10](result10.png)

* demo 23
![result23](result23.png)

* demo 24
![result24](result24.png)

