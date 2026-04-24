from database.repositories.test_repo import test_get_all_users_repo 

def test_get_all_users_service():
    users =  test_get_all_users_repo()

    result = []
    for i in range(len(users)):
        result.append(users[i]["first_name"]+" "+users[i]["last_name"])

    return result