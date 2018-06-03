import React, { Component } from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';
import PropTypes from 'prop-types';

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_HPP = 'hitsPerPage=';
const PARAM_PAGE = 'page=';

// const isSearched = searchTerm => item =>
// 	item.title.toLowerCase().includes(searchTerm.toLowerCase());

class App extends Component {

	_isMounted = false;

	constructor(props) {
		super(props);

		this.state = {
			results: null,
			searchKey: '',
			searchTerm: DEFAULT_QUERY,
			error: null,
		};

		this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
		this.setSearchTopStories = this.setSearchTopStories.bind(this);
		this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
		this.onDismiss = this.onDismiss.bind(this);
		this.onSearchSubmit = this.onSearchSubmit.bind(this);
		this.onSearchChange = this.onSearchChange.bind(this);
	}

	needsToSearchTopStories(searchTerm) {
		return !this.state.results[searchTerm];
	}

	setSearchTopStories(result) {
		const { hits, page } = result;
		const { searchKey, results } = this.state;

		const oldHits = results && results[searchKey]
			? results[searchKey].hits
			: [];

		const updatedHits = [
			...oldHits,
			...hits
		];

		this.setState({ 
			results: {
				...results, 
				[searchKey]: { hits: updatedHits, page} 
			}

			});
	}

	fetchSearchTopStories(searchTerm, page = 0) {
		axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
			.then(result => this._isMounted && this.setSearchTopStories(result.data))
			.catch(error => this._isMounted && this.setState({ error }));
	}

	componentDidMount() {
		this._isMounted = true;

		const { searchTerm } = this.state;
		this.setState({ searchKey: searchTerm })
		this.fetchSearchTopStories(searchTerm);
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	onSearchSubmit(event) {
		const { searchTerm } = this.state;
		this.setState({ searchKey: searchTerm })


		if (this.needsToSearchTopStories(searchTerm)){
			this.fetchSearchTopStories(searchTerm);
		}
		event.preventDefault();
	}

	onSearchChange(event){
		this.setState({ searchTerm: event.target.value });
	}

	onDismiss(id) {
		const { searchKey, results } = this.state;
		const { hits, page } = results[searchKey];

		const updatedHits = hits.filter(item => item.objectID !== id);
		this.setState({ 
			//result: Object.assign({}, this.state.result, { hits: updatedHits })
			results: { 
				...results,
				[searchKey]: { hits: updatedHits, page }
			}
		});
	}

  render() {
  	const { 
  		searchTerm, 
  		results,
  		searchKey,
  		error } = this.state;
  	const page = (
  		results && 
  		results[searchKey] && 
  		results[searchKey].page) || 0;
  	const list = (
  			results &&
  			results[searchKey] &&
  			results[searchKey].hits
  		) || [];

    return (
      <div className="page">
      	<div className="interactions">
	      	<Search
	      		value={searchTerm}
	      		onChange={this.onSearchChange}
	      		onSubmit={this.onSearchSubmit}>
	      		Search
	      	</Search>
	      </div>
	     	{ error
		     		? <div className="interactions">
		     		 		<p>Something went wrong.</p>
		     			</div>
				    :  <Table
			      		list={list}
			      		onDismiss={this.onDismiss} />
	     	}
	      
	      <div className="interactions">
	      	<Button onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}>
	      	More
	      </Button>
	      </div>
      </div>
    );
  }
}

const Search = ({ value, onChange, onSubmit, children }) =>
	<form onSubmit={onSubmit}>
		<input 
		type="text" 
		value={value}
		onChange={onChange}/>
		<button type="submit">
			{children}
		</button>
	</form>

const Button = ({ onClick, className, children }) =>
	<button
		onClick={onClick}
		className={className}
		type="button">
		{children}
	</button>

Button.defaultProps = {
	className: '',
};

Button.propTypes = {
	onClick: PropTypes.func.isRequired,
	className: PropTypes.string,
	children: PropTypes.node.isRequired,
};

const Table = ({ list, onDismiss }) =>
	<div className="table">
		{list.map(item =>
			<div key={item.objectID} className="table-row">
				<span style={{ width: '40%' }}>
					<a href={item.url}>{item.title}</a>
				</span>
				<span style={{ width: '30%' }}>{item.author}</span>
				<span style={{ width: '10%' }}>{item.num_comments}</span>
				<span style={{ width: '10%' }}>{item.points}</span>
				<span style={{ width: '10%' }}>
					<Button onClick={()=>onDismiss(item.objectID)}
					 className="button-inline">
						Dismiss
					</Button>
				</span>
			</div>
		)}
	</div>

Table.propTypes = {
	list: PropTypes.arrayOf(
		PropTypes.shape({
			objectID: PropTypes.string.isRequired,
			author: PropTypes.string,
			url: PropTypes.string,
			num_comments: PropTypes.number,
			points: PropTypes.number,
		})
	).isRequired,
	onDismiss: PropTypes.func.isRequired,
};

export default App;

export {
	Button,
	Search,
	Table,
};
