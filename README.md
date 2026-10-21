# Inquiry App for Enonic XP

This Enonic XP application lets you create inquiry forms for your visitors. It will display a small popup on your site which can be expanded into a larger modal with a form. Customization options allow you to write texts in the popup/modal, create questions, set the type of answers (textfields, checkboxes, radiobuttons) and choose between a light or dark color theme. All submitted responses will be saved and can be viewed and exported via the Inquiry App admin tool.

## Installation
### Enonic Market

You can install the app from the [Enonic Market](https://market.enonic.com) and add it to your site via Content Studio. Create content of type **Inquiry** under the site to configure each inquiry.

### Build it yourself

If you wish to build it yourself, you can run the `make package` command in the main directory to build and package the application. This will create a JAR file in the `/deploy` folder which you can use to install the app.

## Notes

Each inquiry is configured as its own content item. Activate it, choose **All pages** or **Specific pages**, and publish it to display it on the live site. Specific page selections apply only to those pages, not their descendants. Inquiries are restricted to the site they belong to.

Several inquiries can be active at the same time. If more than one matches a page, inquiries targeting **All pages** are shown before inquiries targeting **Specific pages**. Within each group, inquiries are shown in content-path order. When one is closed, the next matching inquiry appears immediately, without a page reload. After submission, the next inquiry appears when the thank-you message is closed, or immediately if no thank-you message is configured. Closing one inquiry does not dismiss the others.

The content ID automatically identifies the inquiry and its responses. Editors do not need to enter unique identifiers. To start a new inquiry, create a new content item. Question IDs are generated automatically when the inquiry is saved and retained when it is edited.

When upgrading from site-config inquiries, recreate the configuration as Inquiry content before publishing. Site-config inquiries are no longer displayed. Previously collected responses remain available in the admin tool under their original identifiers; new responses are stored separately under the new content ID.

## Developers
To get info about development, see [development documentation](code/src/docs/en/development.md).
