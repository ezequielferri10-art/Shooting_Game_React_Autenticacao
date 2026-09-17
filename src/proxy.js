import { NextResponse } from "next/server"

export function proxy(request){
    const token = request.cookies.get('token')?.value

    //Se tentar acessar o dashboard sem o cookie do token, barra e redireciona
    if(request.nextUrl.pathname.startsWith('/dashboard') && !token){
        console.log('Acesso negado! Redirecionando para /login ....')
        return NextResponse.redirect(new URL('/login', request.url))
    }

    console.log('Acesso liberado para o dashboard!')
    return NextResponse.next()
}

//o código do proxy será executado na rota /dashboard e em qualquer sub-rota abaixo dela
export const config = {
    matcher: ['/dashboard/:path*']
}