/* eslint no-unused-vars: ["off"] */
import $ from 'common/jquery';
import createPlugin from 'jquery-plugin-generator';

import 'util/jquery.destroyed';
import namespace from 'util/namespace';

/**
 * Menu which is opened by hovering a link with data-menu-trigger
 */
class Menu {

    static get Defaults () {
        return {
            'expandedHeaderClassName': 'header--with-menu',
            'hoveredMenuItemClassName': 'btn--with-menu'
        };
    }

    constructor ($container, opts) {
        const options = this.options = $.extend({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.$content = $container.find('.js-menu-content');
        this.$header = $('.js-header');
        this.$close = $container.find('.js-menu-close');
        this.ns = namespace();
        this.leaveTimer = null;

        const id = $container.attr('id');
        const triggers = `[data-menu-trigger="#${ id }"]`;

        $container.on('destroyed', this.destroy.bind(this));

        $(document)
            .on(`click.${ this.ns }`, triggers, this.show.bind(this));

        // this.$content
        //     .on('mouseleave', this.hideDelayed.bind(this));
        
        this.$close
            .on('click', this.hideDelayed.bind(this));

        this.toggleScroll(true);
    }

    hideDelayed (event) {
        if(event) {
            if($(event.relatedTarget).parents('.js-menu-content').length){
                return true;
            }

            if(`#${this.$container.attr('id')}` == $(event.relatedTarget).data('menu-trigger')) {
                return true;
            }
        }

        if (!this.leaveTimer) {
            this.leaveTimer = setTimeout(this.hide.bind(this), 60);
        }
    }

    hide () {

        if ($('.js-header').hasClass('header--collapsed-back')) {
            $('.js-header').addClass('header--collapsed');
        }

        const $container = this.$container;
        $container.removeClass('is-active');

        this.leaveTimer = null;

        $container.attr('aria-hidden', true);

        $container.transitionstop(() => {
            this.$header.removeClass(this.options.expandedHeaderClassName);

            $(`[data-menu-trigger="#${ $container.prop('id') }"]`)
                .removeClass(this.options.hoveredMenuItemClassName);

            $container.transition('menu-out').trigger('menu-hide');

            this.toggleScroll(true);
        });
    }

    show () {
   
        const $container = this.$container;

        if($container.hasClass('is-active')) {
            this.hideDelayed();
            return true;
        }

        $('[data-plugin="menu"]').each(function(i, el) {
            if ($(el).hasClass('is-active')) {
                $(el).menu('hide');
            }
        });

        $container.addClass('is-active');

        if (this.leaveTimer) {
            clearTimeout(this.leaveTimer);
            this.leaveTimer = null;
        } else {
            $container.attr('aria-hidden', false);

            $container.transitionstop(() => {
                $container.trigger('menu-show');
                $container.transition('menu-in');
                this.$header.addClass(this.options.expandedHeaderClassName);

                $(`[data-menu-trigger="#${ $container.prop('id') }"]`)
                    .addClass(this.options.hoveredMenuItemClassName);

                setTimeout(() => {
                    if ($('.js-header').hasClass('header--collapsed')) {
                        $('.js-header').removeClass('header--collapsed').addClass('header--collapsed-back');
                    }
                }, 300);

                this.toggleScroll(false);
            });
        }
    }

    toggleScroll (isEnabled) {
        if ($.isCustomScroll()) {
            // Enable / disable custom scroll
            $('body').scroller('setDisabled', !isEnabled);
        } else {
            // Enable / disable native scroll
            $('html').toggleClass('with-modal', !isEnabled);
        }
    }

    destroy () {
        // Cleanup global events
        $(window).add(document).off(`.${ this.ns }`);
    }
}

$.fn.menu = createPlugin(Menu);
