const getCookie = name => {
    if (typeof document === "undefined" || !document.cookie) {
        return ""
    }
    const cookie = document.cookie
        .split(";")
        .map(cookie => cookie.trim())
        .find(cookie => cookie.substring(0, name.length + 1) === `${name}=`)
    return cookie ? decodeURIComponent(cookie.substring(name.length + 1)) : ""
}

const handleFetchErrors = response => {
    if (!response.ok) {
        throw response
    }
    return response
}

export const get = (url, params = {}) => {
    const csrfToken = getCookie("csrftoken")
    const queryString = Object.keys(params)
        .map(
            key =>
                `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
        )
        .join("&")
    if (queryString.length) {
        url = `${url}?${queryString}`
    }
    return fetch(url, {
        method: "GET",
        headers: {
            "X-CSRFToken": csrfToken,
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest"
        },
        credentials: "include"
    }).then(handleFetchErrors)
}

export const post = (url, object = {}, files = {}) => {
    const csrfToken = getCookie("csrftoken")
    const fetchOptions = {
        method: "POST",
        headers: {
            "X-CSRFToken": csrfToken,
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest"
        },
        credentials: "include"
    }

    if (Object.keys(files).length) {
        const body = new FormData()
        body.append("csrfmiddlewaretoken", csrfToken)
        body.append("json", JSON.stringify(object))
        Object.keys(files).forEach(key => {
            const value = files[key]
            if (typeof value === "object" && value.file && value.filename) {
                body.append(key, value.file, value.filename)
            } else if (Array.isArray(value)) {
                value.forEach(item => body.append(`${key}[]`, item))
            } else {
                body.append(key, value)
            }
        })
        fetchOptions.body = body
    } else {
        fetchOptions.headers["Content-Type"] = "application/json"
        fetchOptions.body = JSON.stringify(object)
    }

    return fetch(url, fetchOptions).then(handleFetchErrors)
}

export const postJson = (url, object = {}, files = {}) =>
    post(url, object, files).then(response =>
        response.json().then(json => ({json, status: response.status}))
    )
