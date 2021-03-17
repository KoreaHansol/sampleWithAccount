const _ = require("lodash")
const mysql = require("mysql");
const defaultConnOption = require("../config/mysql").connectOption;

const connectionPoolMap = {}

function getConnectionPool( connOption ) {
  if( !connOption ) {
    throw new Error( 'connection option is null' )
  }

  let key = JSON.stringify( connOption )
  
  let connectionPool = connectionPoolMap[key]

  if( !connectionPool ) {
    if( process.env.NODE_ENV === "production" ) {
      connectionPool = mysql.createPool({
        ...connOption,
        connectionLimit : 1
      });
    } else {
      connectionPool = mysql.createPool( connOption );
    }
    
    connectionPoolMap[key] = connectionPool
  }

  return connectionPool
}

function Transaction(connOption) {
  this.connOption = connOption;
  
  this.callStack = [];

  return ( asyncFn ) => {
    let isBase = false;
    let conn = this.callStack[0];
    if (!conn) {
      isBase = true;
      conn = new Conn();
    }

    this.callStack.unshift(conn);

    const makeConn = (resolve, reject) => {
      if (isBase) {
        getConnectionPool( this.connOption ).getConnection( ( err, connection ) => {
          if (err) {
            end(resolve, reject, null, err);
          } else {
            conn.connection = connection
            beginTransaction(resolve, reject);
          }
        })
      } else {
        beginTransaction(resolve, reject);
      }
    };

    const beginTransaction = (resolve, reject) => {
      if (isBase) {
        conn.connection.beginTransaction(err => {
          if (err) {
            endConn(resolve, reject, null, err);
          } else {
            execute(resolve, reject);
          }
        });
      } else {
        execute(resolve, reject);
      }
    };

    const execute = (resolve, reject) => {
      try {
        let promise = asyncFn(conn);

        if (typeof promise.then !== "function") {
          endTransaction(resolve, reject, promise, null);
        } else {
          promise
            .then(res => {
              endTransaction(resolve, reject, res, null);
            })
            .catch(err => {
              endTransaction(resolve, reject, null, err);
            });
        }
      } catch (err) {
        endTransaction(resolve, reject, null, err);
      }
    };

    const endTransaction = (resolve, reject, succ, err) => {
      if (isBase && err) {
        conn.connection.rollback(() => {
          endConn(resolve, reject, null, err);
        });
      } else if (isBase && !err) {
        conn.connection.commit(commitErr => {
          if (commitErr) {
            conn.connection.rollback(() => {
              endConn(resolve, reject, null, commitErr);
            });
          } else {
            endConn(resolve, reject, succ, null);
          }
        });
      } else {
        endConn(resolve, reject, succ, err);
      }
    };

    const endConn = (resolve, reject, succ, err) => {
      if (isBase) {
        conn.connection.release()
        end(resolve, reject, succ, err);
      } else {
        end(resolve, reject, succ, err);
      }
    };

    const end = (resolve, reject, succ, err) => {
      this.callStack.shift();
      if (err) {
        reject(err);
      } else {
        resolve(succ);
      }
    };

    return new Promise((resolve, reject) => {
      if (!asyncFn) {
        reject(new Error("Async Function Empty"));
      } else {
        makeConn(resolve, reject);
      }
    });
  };
}

function Conn() {
  this.connection = null;
}

Conn.prototype.query = function(sql, paramArr) {
  return new Promise((resolve, reject) => {
    if (!this.connection) {
      reject(new Error("Connection is null"));
      return;
    }

    const callback = (err, results, fields) => {
      if (err) {
        reject(err);
      } else {
        results._fields = fields;
        resolve(results);
      }
    };

    if (paramArr) {
      this.connection.query(sql, paramArr, callback);
    } else {
      this.connection.query(sql, callback);
    }
  });
};

Conn.prototype.resultsAsCamelCase = function( results ) {
  if( !results || !results[0] ) {
    return []
  }

  return _.map( results, item => {
    return _.reduce( item, ( m, v, k ) => {
      m[_.camelCase( k )] = v
      return m
    }, {} )
  })
};

function begin( connOption, asyncFn ) {
  if( connOption && !asyncFn && typeof connOption === 'function' ) {
    asyncFn = connOption
    connOption = defaultConnOption
  }

  let tran = new Transaction( connOption )
  return tran( asyncFn )
}

module.exports = begin
