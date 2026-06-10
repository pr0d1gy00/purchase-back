import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            // Extrae el token del header "Authorization: Bearer <token>"
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'super-secreto-compartido',
        });
    }

    // Esta función se ejecuta sola si el token es válido.
    // Lo que devuelva esto, va a inyectarse automáticamente en `request.user`
    async validate(payload: any) {
        return { userId: payload.sub, email: payload.email };
    }
}
