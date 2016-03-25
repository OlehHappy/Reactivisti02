import assert from 'assert';
import { Map } from 'immutable';
import sinon from '../../../sinon.js';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import moment from 'moment';

import PrioritizeLink, { __RewireAPI__ as PrioritizeLinkRewireAPI } from '../../components/PrioritizeLink.js';



describe('PrioritizeLink component', function() {

	it('should not render any link in case next crawl timestamp is less than 2 minutes in future', function() {
		var page = new Map({
			id: 1,
			nextCrawlTimestamp: moment().add(1, 'minutes').format(),
		});

		var dispatch = this.sinon.spy();

		var prioritizeLinkComponent = TestUtils.renderIntoDocument(
			<PrioritizeLink page={page} dispatch={dispatch}>
				Check now
			</PrioritizeLink>
		);

		// We don't want to see any link in the output
		assert.equal(
			TestUtils.scryRenderedDOMComponentsWithTag(
				prioritizeLinkComponent,
				'a'
			).length,
			0
		);
	});



	it('should render link if next crawl timestamp is more than 2 minutes in future', function() {
		var page = new Map({
			id: 1,
			nextCrawlTimestamp: moment().add(3, 'minutes').format(),
		});

		var dispatch = this.sinon.spy();

		var prioritizeLinkComponent = TestUtils.renderIntoDocument(
			<PrioritizeLink page={page} dispatch={dispatch}>
				Check now
			</PrioritizeLink>
		);

		// There will be only one link in the output
		assert.equal(
			TestUtils.scryRenderedDOMComponentsWithTag(
				prioritizeLinkComponent,
				'a'
			).length,
			1
		);
	});



	it('should update itself while page is open', function() {
		var page1 = new Map({
			id: 1,
			nextCrawlTimestamp: moment().add(2, 'minutes').add(5, 'seconds').format(),
		});

		var page2 = new Map({
			id: 2,
			nextCrawlTimestamp: moment().add(2, 'minutes').add(10, 'seconds').format(),
		});

		var dispatch = this.sinon.spy();

		var Wrapper = React.createClass({
			render: function() {
				return (
					<div>
						{this.props.children}
					</div>
				);
			},
		});

		var prioritizeLinkComponent = TestUtils.renderIntoDocument(
			<Wrapper>
				<PrioritizeLink page={page1} dispatch={dispatch}>
					Check now
				</PrioritizeLink>
				<PrioritizeLink page={page2} dispatch={dispatch}>
					Check now
				</PrioritizeLink>
			</Wrapper>
		);

		// We have 2 links rendered - both pages will be checked in more than 2 minutes
		assert.equal(
			TestUtils.scryRenderedDOMComponentsWithTag(
				prioritizeLinkComponent,
				'a'
			).length,
			2
		);

		// Let's shift time to the future
		this.clock.tick(7 * 1000);

		// Only one link is visible now - page 1 will be checked in less than 2 minutes
		assert.equal(
			TestUtils.scryRenderedDOMComponentsWithTag(
				prioritizeLinkComponent,
				'a'
			).length,
			1
		);
	});



	describe('interaction', function() {
		var prioritizePage;



		before(function() {
			prioritizePage = this.sinon.spy();

			// Override the dependency of our component
			PrioritizeLinkRewireAPI.__Rewire__('prioritizePage', prioritizePage);
		});



		it('should call prioritizePage() on click', function() {
			var page = new Map({
				id: 1,
				nextCrawlTimestamp: moment().add(5, 'minutes').format(),
			});

			var dispatch = this.sinon.spy();

			var prioritizeLinkComponent = TestUtils.renderIntoDocument(
				<PrioritizeLink page={page} dispatch={dispatch}>
					Check now
				</PrioritizeLink>
			);

			TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithTag(
				prioritizeLinkComponent,
				'a'
			));

			// Check dispatch has been called exactly once
			assert.equal(true, dispatch.calledOnce);

			// Check 'prioritizePage' action has been called with correct arguments
			sinon.assert.calledWith(prioritizePage, page);
		});



		after(function() {
			// Reset overridden dependency
			PrioritizeLinkRewireAPI.__ResetDependency__('prioritizePage');
		});

	});

});
