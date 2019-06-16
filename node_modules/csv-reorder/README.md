# csv-reorder

csv-reorder is a small library that makes it easy to reorder the rows on a csv file given a column name. It can be used both as a command line utility, as well as a standalone node.js library.

### Requirements

`csv-reoder` requires `node.js@^6.x.x`, as well as `npm@^4.x.x` or `Yarn`.

## CLI Usage

### Installation

To install the cli globally, from npm:

```
npm install -g csv-reorder
```

Or downloading and running locally:

```
npm install -g
```

### Options

#### Input and Output

`--input <path to file> --output <path to output>`

alternatively, using the short form:

`-I <path to file> -O <path to output>`

The output file cannot be the same as the input file.

#### Sort order

In order for the rows to be sorted, csv-reorder must be given a column name:

`--sort <column name>`

or, in its short form

`-S <column name>`

Occasionally, a user might want to sort the rows by a property that shouldn't be interpreted as a string. In that case, the argument `sort-type` should be given:

`--sort-type <type: 'number', 'date', 'boolean', 'string' (default)>`

or

`-T <...>`

Sorting can also be set as ascending (default) or descending:

`--ascending`, which is equivalent to `-A`

or

`--descending`, equivalent to `-D`

#### Remove duplicate rows

A .csv document may contain duplicate rows. In order to remove duplicate rows from the final output file, use the following flag:

`--remove-duplicates` or `-R`

#### Metadata and stats output

`csv-reorder` will output statistics about the operation unless told otherwise. For no output, use:

`--silent` or `-Q`

#### Help

For an explanation of each cli flag, run the command:

```
csv-reorder --help
```

## Standalone Library

As an alternative, `csv-reorder` can also be used as a standalone library.

Install `csv-reorder` with `npm`:

```
npm install csv-reorder --save
```

or, if you're using `Yarn`

```
yarn add csv-reorder
```

#### Usage

Example script:

```js
const reorder = require('csv-reorder');

reorder({
  input: './file.csv',
  output: './output.csv',
  sort: 'Launch Date',
  type: 'date',
  descending: false,
  remove: true,
  metadata: false
})
.then(metadata => {
  // ...
})
.catch(error => {
  // ...
});
```

## Known issues

Due to limitations in the csv specification, it is possible for valid csv files not to include a table header as it's first row. `csv-reorder` will always consider the first row to be a table header, and behave accordingly.

## License

[MIT](http://opensource.org/licenses/MIT)
