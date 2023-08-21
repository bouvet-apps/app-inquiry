# Inquiry App for Enonic XP

This Enonic XP application lets you create inquiry forms for your visitors. It will display a small popup on your site which can be expanded into a larger modal with a form. Customization options allow you to write texts in the popup/modal, create questions, set the type of answers (textfields, checkboxes, radiobuttons) and choose between a light or dark color theme. All submitted responses will be saved and can be viewed and exported via the Inquiry App admin tool.

## Installation
### Enonic Market

You can install the app from the [Enonic Market](https://market.enonic.com), add it to your site via Content Studio and start configuring it.

### Build it yourself

If you wish to build it yourself, you can run the `make install_new_dependencies` command in the main directory to install the necessary packages. Then you can run the `make package` command to build and package the application. This will create a JAR file in the `/deploy` folder which you can use to install the app.

## Notes

While you can have only one inquiry active at a time, it is possible to create several different inquiries over time and display the responses for each of these in the admin tool. In order to correctly process, save and display all the created inquiries and it's responses, it is however important to use unique identifiers. When you first set up the app, the default inquiry ID will be set as `Inquiry-1`. This can be changed at any time. If the inquiry is active, all responses will be saved under the currently set inquiry ID. So if you wish to start a different inquiry, you can simply change the identifier to something new and unique.

The same principle applies to the questions as well, which all need to have some indentifier set (the selector can generate something for you). Once an inquiry is active and has started to collect responses, these IDs should not be changed anymore unless you wish to have it processed as a different question.

## Developers
To get info about development, see [development documentation](code/src/docs/en/development.md).
