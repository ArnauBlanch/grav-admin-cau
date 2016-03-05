import $ from 'jquery';
import Sortable from 'sortablejs';
import '../../utils/jquery-utils';

export default class CollectionsField {
    constructor() {
        this.lists = $();

        $('[data-type="collection"]').each((index, list) => this.addList(list));
        $('body').on('mutation._grav', this._onAddedNodes.bind(this));

    }

    addList(list) {
        list = $(list);
        this.lists = this.lists.add(list);

        list.on('click', '> .collection-actions [data-action="add"]', (event) => this.addItem(event));
        list.on('click', '> ul > li > .item-actions [data-action="delete"]', (event) => this.removeItem(event));

        list.find('[data-collection-holder]').each((index, container) => {
            container = $(container);
            if (container.data('collection-sort')) { return; }

            container.data('collection-sort', new Sortable(container.get(0), {
                forceFallback: true,
                animation: 150,
                filter: '.CodeMirror, .grav-editor-resizer',
                onUpdate: () => this.reindex(container)
            }));
        });
    }

    addItem(event) {
        let button = $(event.currentTarget);
        let list = button.closest('[data-type="collection"]');
        let template = $(list.find('> [data-collection-template="new"]').data('collection-template-html'));

        list.find('> [data-collection-holder]').append(template);
        this.reindex(list);
        // button.data('key-index', keyIndex + 1);

        // process markdown editors
        /* var field = template.find('[name]').filter('textarea');
        if (field.length && field.data('grav-mdeditor') && typeof MDEditors !== 'undefined') {
            MDEditors.add(field);
        }*/
    }

    removeItem(event) {
        let button = $(event.currentTarget);
        let item = button.closest('[data-collection-item]');
        let list = button.closest('[data-type="collection"]');

        item.remove();
        this.reindex(list);
    }

    reindex(list) {
        list = $(list).closest('[data-type="collection"]');

        let items = list.find('> ul > [data-collection-item]');

        items.each((index, item) => {
            item = $(item);
            item.attr('data-collection-key', index);

            ['name', 'data-grav-field-name', 'id', 'for'].forEach((prop) => {
                item.find('[' + prop + ']').each(function() {
                    let element = $(this);
                    let indexes = [];
                    element.parents('[data-collection-key]').map((idx, parent) => indexes.push($(parent).attr('data-collection-key')));
                    indexes.reverse();

                    let replaced = element.attr(prop).replace(/\[(\d+|\*)\]/g, (/* str, p1, offset */) => {
                        return `[${indexes.shift()}]`;
                    });

                    element.attr(prop, replaced);
                });
            });

        });
    }

    _onAddedNodes(event, target/* , record, instance */) {
        let collections = $(target).find('[data-type="collection"]');
        if (!collections.length) { return; }

        collections.each((index, collection) => {
            collection = $(collection);
            if (!~this.lists.index(collection)) {
                this.addList(collection);
            }
        });
    }
}

export let Instance = new CollectionsField();
