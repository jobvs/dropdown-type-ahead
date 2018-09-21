
# Dropdown Typeahead
An input widget used to display and edit associations

## Features
* Allow the user to search for matching options
* Asynchronous loading of options
* Supports different data sources
    - Xpath
    - Microflow
    - Nanoflow
* Supports on change actions
    - call a microflow
    - call a nanoflow
* Supports `Tab` or `Enter` keys to auto complete suggested selection
* Supports `Back space` key to clear selection

## Dependencies
Mendix 7.13.1

## Demo project
[https://dropdowntypeahead.mxapps.io]( https://dropdowntypeahead.mxapps.io)

## Usage
![dropdown-typeahead](/assets/dropdown-typeahead-normal-loading.gif)

* Place the widget in data form within the context of an entity 
* Select entity path and attribute over reference for selectable objects
* Select the data source

## Basic configuration
For a basic configuration, set up the widget as indicated below:-
### Data source
![dropdown-typeahead-data-source](/assets/dropdown-typeahead-data-source.png)
### Appearance  
![dropdown-typeahead-appearance](/assets/dropdown-typeahead-appearance.png)  
### Label
![dropdown-typeahead-label](/assets/dropdown-typeahead-label.png)  
### Selectable objects
![dropdown-typeahead-selectable-objects](/assets/dropdown-typeahead-selectable.png)  
### Search
![dropdown-typeahead-search](/assets/dropdown-typeahead-search.png)  
### Events
![dropdown-typeahead-events](/assets/dropdown-typeahead-events.png)

## Issues, suggestions and feature requests
We are actively maintaining this widget, please report any issues or suggestion for improvement at  
https://github.com/mendixlabs/dropdown-type-ahead/issues

## Development and contribution
Please follow [development guide](/development.md)
