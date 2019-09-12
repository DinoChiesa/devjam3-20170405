var scope= context.getVariable("accesstoken.scope");
var scopes;
var userInfo={};

function lookupVariable(key) {
  switch(key) {
  case 'sub' : return 'accesstoken.subject';
  }
  return key;
}

function addOneKey(key, value){
  value = value || context.getVariable(lookupVariable(key));
  if (value !== null && value !== "" ){
    userInfo[key]=value;
  }
}

if (scope !== null){
  scopes=scope.split(" ");

  for (var i in scopes){
    if (scopes[i] == 'profile' ){
      ['sub', 'name', 'family_name', 'given_name', 'picture', 'gender', 'preferred_username']

        .forEach(addOneKey);
    }

    if (scopes[i] == 'email'){
      addOneKey('email', 'accesstoken.subject');
      if (userInfo.email) {
        userInfo.email_verified = 'true';
      }
    }
  }

}

context.setVariable('userInfoResponse', JSON.stringify(userInfo));
